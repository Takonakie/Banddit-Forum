import { type User, type Post, type Comment } from "@shared/schema";

export class DataTransformer {
  static transformUser(mongoUser: any): User {
    return {
      _id: mongoUser._id.toString(),
      id: mongoUser._id.toString(),
      username: mongoUser.username,
      password: mongoUser.password,
      email: mongoUser.email,
      isVerified: mongoUser.isVerified || false,
      createdAt: mongoUser.createdAt,
    };
  }

  static transformPost(mongoPost: any): Post {
    return {
      _id: mongoPost._id.toString(),
      id: mongoPost._id.toString(),
      title: mongoPost.title,
      content: mongoPost.content,
      authorId: mongoPost.authorId.toString(),
      votes: mongoPost.votes,
      createdAt: mongoPost.createdAt,
      updatedAt: mongoPost.updatedAt,
    };
  }

  static transformPostWithAuthor(mongoPost: any): (Post & { author: User }) | null {
    const author = mongoPost.authorId;

    if (!author) {
      return null;
    }

    return {
      _id: mongoPost._id.toString(),
      id: mongoPost._id.toString(),
      title: mongoPost.title,
      content: mongoPost.content,
      authorId: author._id.toString(),
      votes: mongoPost.votes,
      createdAt: mongoPost.createdAt,
      updatedAt: mongoPost.updatedAt,
      author: this.transformUser(author),
    };
  }

  static transformComment(mongoComment: any): Comment {
    return {
      _id: mongoComment._id.toString(),
      id: mongoComment._id.toString(),
      content: mongoComment.content,
      authorId: mongoComment.authorId.toString(),
      postId: mongoComment.postId.toString(),
      parentId: mongoComment.parentId ? mongoComment.parentId.toString() : null,
      votes: mongoComment.votes,
      createdAt: mongoComment.createdAt,
      updatedAt: mongoComment.updatedAt,
    };
  }

  static transformCommentWithAuthor(mongoComment: any): Comment & { author: User } {
    const author = mongoComment.authorId;
    return {
      _id: mongoComment._id.toString(),
      id: mongoComment._id.toString(),
      content: mongoComment.content,
      authorId: author._id.toString(),
      postId: mongoComment.postId.toString(),
      parentId: mongoComment.parentId ? mongoComment.parentId.toString() : null,
      votes: mongoComment.votes,
      createdAt: mongoComment.createdAt,
      updatedAt: mongoComment.updatedAt,
      author: this.transformUser(author),
    };
  }
}