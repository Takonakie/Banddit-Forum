import { type User, type Post, type InsertPost } from "@shared/schema";
import PostModel from "../../models/Post";
import { BaseStorage } from "../base/BaseStorage";
import { DataTransformer } from "../base/DataTransformer";
import { VotingService } from "../services/VotingService";

export class PostRepository extends BaseStorage {
  async getAllPosts(): Promise<(Post & { author: User })[]> {
    try {
      await this.ensureConnection();
      const posts = await PostModel.find().populate("authorId").sort({ createdAt: -1 });
      
      return posts.map(post => DataTransformer.transformPostWithAuthor(post));
    } catch (error) {
      this.handleError("getting all posts", error);
      return [];
    }
  }

  async getAllPostsWithUserVotes(userId?: string, page: number = 1, limit: number = 10): Promise<{ posts: (Post & { author: User })[], totalPosts: number }> {
    try {
      await this.ensureConnection();
      
      const skip = (page - 1) * limit;
      
      const postsQuery = PostModel.find()
        .populate("authorId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
        
      const posts = await postsQuery;
      const totalPosts = await PostModel.countDocuments();
      
      const postsWithVotes = (await Promise.all(posts.map(async (post) => {
    let userVote = 0;
    if (userId) {
      userVote = await VotingService.getUserVote(post._id.toString(), userId, 'Post');
    }
    
    // Gunakan transformer yang sudah kita perbaiki
    const transformedPost = DataTransformer.transformPostWithAuthor(post);

    // Jika post tidak valid, kembalikan null
    if (!transformedPost) {
      return null;
    }

    return {
      ...transformedPost,
      userVote,
    };
  }))).filter(Boolean);
      
      return { posts: postsWithVotes, totalPosts };
    } catch (error) {
      this.handleError("getting posts with user votes", error);
      return { posts: [], totalPosts: 0 };
    }
  }

  async getPost(id: string): Promise<(Post & { author: User }) | undefined> {
    try {
      await this.ensureConnection();
      const post = await PostModel.findById(id).populate("authorId");
      if (!post) return undefined;
      
      return DataTransformer.transformPostWithAuthor(post);
    } catch (error) {
      this.handleError("getting post", error);
      return undefined;
    }
  }

  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    try {
      await this.ensureConnection();
      const posts = await PostModel.find({ authorId }).sort({ createdAt: -1 });
      
      return posts.map(post => DataTransformer.transformPost(post));
    } catch (error) {
      this.handleError("getting posts by author", error);
      return [];
    }
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    try {
      await this.ensureConnection();
      const post = new PostModel(insertPost);
      const savedPost = await post.save();
      
      return DataTransformer.transformPost(savedPost);
    } catch (error) {
      this.handleError("creating post", error);
      throw error;
    }
  }

  async updatePost(id: string, updates: Partial<InsertPost>): Promise<Post | undefined> {
    try {
      await this.ensureConnection();
      const post = await PostModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
      
      if (!post) return undefined;
      
      return DataTransformer.transformPost(post);
    } catch (error) {
      this.handleError("updating post", error);
      return undefined;
    }
  }

  async deletePost(id: string): Promise<boolean> {
    try {
      await this.ensureConnection();
      const result = await PostModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      this.handleError("deleting post", error);
      return false;
    }
  }

  async votePost(postId: string, userId: string, voteType: number): Promise<(Post & { author: User }) | undefined> {
    try {
      await this.ensureConnection();
      
      await VotingService.voteOnPost(postId, userId, voteType);
      
      const post = await PostModel.findById(postId).populate('authorId');
      if (!post) return undefined;
      
      return {
        ...DataTransformer.transformPostWithAuthor(post),
        userVote: voteType,
      };
    } catch (error) {
      this.handleError("voting on post", error);
      return undefined;
    }
  }
}