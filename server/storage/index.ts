import { type User, type Post, type Comment, type InsertUser, type InsertPost, type InsertComment } from "@shared/schema";
import { UserRepository } from "./repositories/UserRepository";
import { PostRepository } from "./repositories/PostRepository";
import { CommentRepository } from "./repositories/CommentRepository";
import { type CommentTree } from "./services/ThreadingService";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { verificationToken?: string; verificationTokenExpires?: Date }): Promise<User>;
  findUserByVerificationToken(token: string): Promise<User | undefined>;
  verifyUser(userId: string): Promise<void>;
  
  // Post methods
  getAllPosts(): Promise<(Post & { author: User })[]>;
  getAllPostsWithUserVotes(userId?: string, page?: number, limit?: number): Promise<{ posts: (Post & { author: User })[], totalPosts: number }>;
  getPost(id: string): Promise<(Post & { author: User }) | undefined>;
  getPostsByAuthor(authorId: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, updates: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;
  votePost(postId: string, userId: string, voteType: number): Promise<(Post & { author: User }) | undefined>;
  
  // Comment methods
  getCommentsByPost(postId: string): Promise<(Comment & { author: User })[]>;
  getCommentsByPostWithUserVotes(postId: string, userId?: string): Promise<(Comment & { author: User })[]>;
  getComment(id: string): Promise<(Comment & { author: User }) | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  createReply(parentCommentId: string, comment: InsertComment): Promise<Comment>;
  getCommentTree(postId: string, userId?: string): Promise<CommentTree[]>;
  updateComment(id: string, updates: Partial<InsertComment>): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<boolean>;
  voteComment(commentId: string, userId: string, voteType: number): Promise<(Comment & { author: User }) | undefined>;
}

export class MongoStorage implements IStorage {
  private userRepo = new UserRepository();
  private postRepo = new PostRepository();
  private commentRepo = new CommentRepository();

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.userRepo.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.userRepo.getUserByUsername(username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.userRepo.getUserByEmail(email);
  }

  async createUser(user: InsertUser & { verificationToken?: string; verificationTokenExpires?: Date }): Promise<User> {
    return this.userRepo.createUser(user);
  }

  async findUserByVerificationToken(token: string): Promise<User | undefined> {
    return this.userRepo.findUserByVerificationToken(token);
  }

  async verifyUser(userId: string): Promise<void> {
    return this.userRepo.verifyUser(userId);
  }

  // Post methods
  async getAllPosts(): Promise<(Post & { author: User })[]> {
    return this.postRepo.getAllPosts();
  }

  async getAllPostsWithUserVotes(userId?: string, page?: number, limit?: number): Promise<{ posts: (Post & { author: User })[], totalPosts: number }> {
    return this.postRepo.getAllPostsWithUserVotes(userId, page, limit);
  }

  async getPost(id: string): Promise<(Post & { author: User }) | undefined> {
    return this.postRepo.getPost(id);
  }

  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    return this.postRepo.getPostsByAuthor(authorId);
  }

  async createPost(post: InsertPost): Promise<Post> {
    return this.postRepo.createPost(post);
  }

  async updatePost(id: string, updates: Partial<InsertPost>): Promise<Post | undefined> {
    return this.postRepo.updatePost(id, updates);
  }

  async deletePost(id: string): Promise<boolean> {
    return this.postRepo.deletePost(id);
  }

  async votePost(postId: string, userId: string, voteType: number): Promise<(Post & { author: User }) | undefined> {
    return this.postRepo.votePost(postId, userId, voteType);
  }

  // Comment methods
  async getCommentsByPost(postId: string): Promise<(Comment & { author: User })[]> {
    return this.commentRepo.getCommentsByPost(postId);
  }

  async getCommentsByPostWithUserVotes(postId: string, userId?: string): Promise<(Comment & { author: User })[]> {
    return this.commentRepo.getCommentsByPostWithUserVotes(postId, userId);
  }

  async getComment(id: string): Promise<(Comment & { author: User }) | undefined> {
    return this.commentRepo.getComment(id);
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    return this.commentRepo.createComment(comment);
  }

  async createReply(parentCommentId: string, comment: InsertComment): Promise<Comment> {
    return this.commentRepo.createReply(parentCommentId, comment);
  }

  async getCommentTree(postId: string, userId?: string): Promise<CommentTree[]> {
    return this.commentRepo.getCommentTree(postId, userId);
  }

  async updateComment(id: string, updates: Partial<InsertComment>): Promise<Comment | undefined> {
    return this.commentRepo.updateComment(id, updates);
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.commentRepo.deleteComment(id);
  }

  async voteComment(commentId: string, userId: string, voteType: number): Promise<(Comment & { author: User }) | undefined> {
    return this.commentRepo.voteComment(commentId, userId, voteType);
  }
}

export const storage = new MongoStorage();