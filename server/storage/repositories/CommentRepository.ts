import { type User, type Comment, type InsertComment } from "@shared/schema";
import CommentModel from "../../models/Comment";
import { BaseStorage } from "../base/BaseStorage";
import { DataTransformer } from "../base/DataTransformer";
import { VotingService } from "../services/VotingService";
import { ThreadingService, type CommentTree } from "../services/ThreadingService";

export class CommentRepository extends BaseStorage {
  async getCommentsByPost(postId: string): Promise<(Comment & { author: User })[]> {
    try {
      await this.ensureConnection();
      const comments = await CommentModel.find({ postId }).populate("authorId").sort({ createdAt: -1 });
      
      return comments.map(comment => DataTransformer.transformCommentWithAuthor(comment));
    } catch (error) {
      this.handleError("getting comments", error);
      return [];
    }
  }

  async getCommentsByPostWithUserVotes(postId: string, userId?: string): Promise<(Comment & { author: User })[]> {
    try {
      await this.ensureConnection();
      console.log('Fetching comments for postId:', postId);
      const comments = await CommentModel.find({ postId }).populate("authorId").sort({ createdAt: -1 });
      console.log('Found comments:', comments.length);
      
      const commentsWithVotes = await Promise.all(comments.map(async (comment) => {
        let userVote = 0;
        if (userId) {
          userVote = await VotingService.getUserVote((comment._id as any).toString(), userId, 'Comment');
        }
        
        return {
          ...DataTransformer.transformCommentWithAuthor(comment),
          userVote,
        };
      }));
      
      return commentsWithVotes;
    } catch (error) {
      this.handleError("getting comments with user votes", error);
      return [];
    }
  }

  async getComment(id: string): Promise<(Comment & { author: User }) | undefined> {
    try {
      await this.ensureConnection();
      const comment = await CommentModel.findById(id).populate("authorId");
      if (!comment) return undefined;
      
      return DataTransformer.transformCommentWithAuthor(comment);
    } catch (error) {
      this.handleError("getting comment", error);
      return undefined;
    }
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    try {
      await this.ensureConnection();
      const comment = new CommentModel({
        ...insertComment,
        postId: insertComment.postId,
        parentId: insertComment.parentId || null
      });
      const savedComment = await comment.save();
      
      return DataTransformer.transformComment(savedComment);
    } catch (error) {
      this.handleError("creating comment", error);
      throw error;
    }
  }

  async createReply(parentCommentId: string, insertComment: InsertComment): Promise<Comment> {
    try {
      await this.ensureConnection();
      
      // Validate parent comment exists
      const parentComment = await CommentModel.findById(parentCommentId);
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }
      
      // Validate reply depth
      const allComments = await CommentModel.find({ postId: insertComment.postId }).populate("authorId");
      const commentsWithAuthor = allComments.map(c => DataTransformer.transformCommentWithAuthor(c));
      
      if (!ThreadingService.validateReplyDepth(parentCommentId, commentsWithAuthor)) {
        throw new Error("Maximum reply depth exceeded");
      }
      
      const reply = new CommentModel({
        ...insertComment,
        parentId: parentCommentId
      });
      const savedReply = await reply.save();
      
      return DataTransformer.transformComment(savedReply);
    } catch (error) {
      this.handleError("creating reply", error);
      throw error;
    }
  }

  async getCommentTree(postId: string, userId?: string): Promise<CommentTree[]> {
    try {
      await this.ensureConnection();
      const comments = await CommentModel.find({ postId }).populate("authorId").sort({ createdAt: -1 });
      
      const commentsWithVotes = await Promise.all(comments.map(async (comment) => {
        let userVote = 0;
        if (userId) {
          userVote = await VotingService.getUserVote((comment._id as any).toString(), userId, 'Comment');
        }
        
        return {
          ...DataTransformer.transformCommentWithAuthor(comment),
          userVote,
        };
      }));
      
      return ThreadingService.buildCommentTree(commentsWithVotes);
    } catch (error) {
      this.handleError("getting comment tree", error);
      return [];
    }
  }

  async updateComment(id: string, updates: Partial<InsertComment>): Promise<Comment | undefined> {
    try {
      await this.ensureConnection();
      const comment = await CommentModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
      
      if (!comment) return undefined;
      
      return DataTransformer.transformComment(comment);
    } catch (error) {
      this.handleError("updating comment", error);
      return undefined;
    }
  }

  async deleteComment(id: string): Promise<boolean> {
    try {
      await this.ensureConnection();
      
      // Delete the comment and all its replies (cascade delete)
      await this.deleteCommentAndReplies(id);
      
      return true;
    } catch (error) {
      this.handleError("deleting comment", error);
      return false;
    }
  }

  private async deleteCommentAndReplies(commentId: string): Promise<void> {
    // Find all replies to this comment
    const replies = await CommentModel.find({ parentId: commentId });
    
    // Recursively delete all replies
    for (const reply of replies) {
      await this.deleteCommentAndReplies((reply._id as any).toString());
    }
    
    // Delete the comment itself
    await CommentModel.findByIdAndDelete(commentId);
  }

  async voteComment(commentId: string, userId: string, voteType: number): Promise<(Comment & { author: User }) | undefined> {
    try {
      await this.ensureConnection();
      
      await VotingService.voteOnComment(commentId, userId, voteType);
      
      const comment = await CommentModel.findById(commentId).populate('authorId');
      if (!comment) return undefined;
      
      return {
        ...DataTransformer.transformCommentWithAuthor(comment),
        userVote: voteType,
      };
    } catch (error) {
      this.handleError("voting on comment", error);
      return undefined;
    }
  }
}