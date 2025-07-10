import { z } from "zod";

// MongoDB schemas using Zod
export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  email: z.string().email(),
  isVerified: z.boolean().optional(),
  verificationToken: z.string().optional(),
  verificationTokenExpires: z.date().optional(),
});

export const insertPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  authorId: z.string(),
});

export const insertCommentSchema = z.object({
  content: z.string().min(1),
  authorId: z.string(),
  postId: z.string(),
  parentId: z.string().optional().nullable(),
});

export const loginUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

// MongoDB document types
export interface User {
  _id: string;
  id: string;
  username: string;
  password: string;
  email: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface Post {
  _id: string;
  id: string;
  title: string;
  content: string;
  authorId: string;
  votes: number;
  userVote?: number; // -1, 0, or 1
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id: string;
  id: string;
  content: string;
  authorId: string;
  postId: string;
  parentId?: string | null;
  votes: number;
  userVote?: number; // -1, 0, or 1
  createdAt: Date;
  updatedAt: Date;
}
