import 'dotenv/config';
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage/index";
import { insertUserSchema, insertPostSchema, insertCommentSchema, loginUserSchema } from "@shared/schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import crypto from 'crypto';
import { sendVerificationEmail } from './email';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Passport.js Google OAuth Configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/api/auth/google/callback",
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await storage.getUserByEmail(profile.emails![0].value);
      if (!user) {
        const newUser = {
          username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).substring(2, 6),
          email: profile.emails![0].value,
          password: await bcrypt.hash(Math.random().toString(36), 10),
          isVerified: true,
        };
        user = await storage.createUser(newUser);
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
));

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(passport.initialize());

  // Google OAuth Routes
  app.get('/api/auth/google', passport.authenticate('google', { session: false }));

  app.get('/api/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err: any, user: any, info: any) => {
      if (err || !user) {
        return res.redirect('/login');
      }
      
      const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
        expiresIn: "24h",
      });
      res.redirect(`/?token=${token}`);
    })(req, res, next);
  });
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(Date.now() + 3600000); // 1 hour

      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpires,
      });

      // Send verification email
      await sendVerificationEmail(user.email, verificationToken);

      res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });

    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.get('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      if (!token) {
        return res.status(400).send('Verification token is missing.');
      }

      const user = await storage.findUserByVerificationToken(token as string);

      if (!user) {
        return res.status(400).send('Invalid or expired verification token.');
      }

      await storage.verifyUser(user._id);
      
      res.redirect('/email-verified?success=true');

    } catch (error) {
      console.error(error);
      res.redirect('/email-verified?success=false');
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check if email is verified
      if (!user.isVerified) {
        return res.status(403).json({ message: "Please verify your email before logging in." });
      }

      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({
        user: { id: user._id, username: user.username, email: user.email },
        token,
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ id: user._id, username: user.username, email: user.email });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Posts routes
  app.get("/api/posts", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { posts, totalPosts } = await storage.getAllPostsWithUserVotes(userId, page, limit);
      
      res.json({
        posts,
        totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/posts", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse({
        ...req.body,
        authorId: req.user.userId,
      });

      const post = await storage.createPost(validatedData);
      const postWithAuthor = await storage.getPost(post._id);
      
      res.status(201).json(postWithAuthor);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.put("/api/posts/:id", authenticateToken, async (req, res) => {
    try {
      const id = req.params.id;
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.authorId !== req.user.userId) {
        return res.status(403).json({ message: "Not authorized to edit this post" });
      }

      const validatedData = insertPostSchema.omit({ authorId: true }).parse(req.body);
      const updatedPost = await storage.updatePost(id, validatedData);
      const postWithAuthor = await storage.getPost(id);
      
      res.json(postWithAuthor);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.delete("/api/posts/:id", authenticateToken, async (req, res) => {
    try {
      const id = req.params.id;
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.authorId !== req.user.userId) {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }

      await storage.deletePost(id);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/posts/:id/vote", authenticateToken, async (req, res) => {
    try {
      const id = req.params.id;
      const { voteType } = req.body;
      const userId = req.user.userId;
      
      const updatedPost = await storage.votePost(id, userId, voteType);
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Comment routes
  app.get("/api/posts/:postId/comments", authenticateToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user?.userId;
      const comments = await storage.getCommentsByPostWithUserVotes(postId, userId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/posts/:postId/comments", authenticateToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.userId;
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        authorId: userId,
        postId,
      });
      
      const comment = await storage.createComment(validatedData);
      // Fetch the complete comment with author and vote data
      const comments = await storage.getCommentsByPostWithUserVotes(postId, userId);
      const fullComment = comments.find(c => c.id === comment.id);
      
      res.status(201).json(fullComment || comment);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.post("/api/comments/:commentId/replies", authenticateToken, async (req, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user.userId;
      
      // Get parent comment to extract postId
      const parentComment = await storage.getComment(commentId);
      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
      
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        authorId: userId,
        postId: parentComment.postId,
        parentId: commentId,
      });
      
      const reply = await storage.createReply(commentId, validatedData);
      
      // Fetch the complete reply with author and vote data
      const comments = await storage.getCommentsByPostWithUserVotes(parentComment.postId, userId);
      const fullReply = comments.find(c => c.id === reply.id);
      
      res.status(201).json(fullReply || reply);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid input data" });
    }
  });

  app.get("/api/posts/:postId/comments/tree", authenticateToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user?.userId;
      const commentTree = await storage.getCommentTree(postId, userId);
      res.json(commentTree);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/comments/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      // Check if user owns the comment
      const comment = await storage.getComment(id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      if (comment.authorId !== userId) {
        return res.status(403).json({ message: "Not authorized to edit this comment" });
      }
      
      const validatedData = insertCommentSchema.omit({ authorId: true, postId: true }).parse(req.body);
      const updatedComment = await storage.updateComment(id, validatedData);
      
      if (!updatedComment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      // Fetch the complete comment with author data
      const fullComment = await storage.getComment(id);
      res.json(fullComment || updatedComment);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.delete("/api/comments/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      // Get the specific comment to check ownership
      const comment = await storage.getComment(id);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      if (comment.authorId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this comment" });
      }
      
      const success = await storage.deleteComment(id);
      if (!success) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/comments/:id/vote", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { voteType } = req.body;
      const userId = req.user.userId;
      
      const updatedComment = await storage.voteComment(id, userId, voteType);
      if (!updatedComment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.json(updatedComment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
