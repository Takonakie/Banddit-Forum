import { type Comment, type User } from "@shared/schema";

export interface CommentTree extends Comment {
  author: User;
  replies: CommentTree[];
  depth: number;
}

export class ThreadingService {
  static buildCommentTree(flatComments: (Comment & { author: User })[]): CommentTree[] {
    const commentMap = new Map<string, CommentTree>();
    const rootComments: CommentTree[] = [];
    
    // First pass: create comment objects with replies array
    flatComments.forEach(comment => {
      commentMap.set(comment.id, {
        ...comment,
        replies: [],
        depth: 0
      });
    });
    
    // Second pass: build tree structure and calculate depth
    flatComments.forEach(comment => {
      const commentNode = commentMap.get(comment.id)!;
      
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          commentNode.depth = parent.depth + 1;
          parent.replies.push(commentNode);
        }
      } else {
        rootComments.push(commentNode);
      }
    });
    
    // Sort replies by creation date (newest first)
    const sortReplies = (comments: CommentTree[]) => {
      comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      comments.forEach(comment => sortReplies(comment.replies));
    };
    
    sortReplies(rootComments);
    return rootComments;
  }

  static validateReplyDepth(parentId: string, comments: (Comment & { author: User })[], maxDepth: number = 6): boolean {
    let depth = 0;
    let currentParentId = parentId;
    
    while (currentParentId && depth < maxDepth) {
      const parent = comments.find(c => c.id === currentParentId);
      if (!parent) break;
      
      currentParentId = parent.parentId || null;
      depth++;
    }
    
    return depth < maxDepth;
  }

  static flattenCommentTree(tree: CommentTree[]): CommentTree[] {
    const flattened: CommentTree[] = [];
    
    const traverse = (comments: CommentTree[]) => {
      comments.forEach(comment => {
        flattened.push(comment);
        if (comment.replies.length > 0) {
          traverse(comment.replies);
        }
      });
    };
    
    traverse(tree);
    return flattened;
  }
}