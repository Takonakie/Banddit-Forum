import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface User {
  id: string;
  username: string;
  email: string;
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  parentId?: string | null;
  votes: number;
  userVote?: number;
  createdAt: string;
  updatedAt: string;
  author: User;
  replies?: Comment[];
  depth?: number;
}

interface CommentsState {
  comments: { [postId: string]: Comment[] };
  commentTrees: { [postId: string]: Comment[] };
  isLoading: boolean;
  error: string | null;
}

const initialState: CommentsState = {
  comments: {},
  commentTrees: {},
  isLoading: false,
  error: null,
};

export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (postId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/posts/${postId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const comments = await response.json();
      return { postId, comments };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

export const createComment = createAsyncThunk(
  "comments/createComment",
  async ({ postId, content }: { postId: string; content: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to create comment");
      }

      const comment = await response.json();
      return { postId, comment };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

export const voteComment = createAsyncThunk(
  "comments/voteComment",
  async ({ id, votes, voteType, postId }: { id: string; votes: number; voteType: number; postId: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/comments/${id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) {
        throw new Error("Failed to vote on comment");
      }

      const comment = await response.json();
      return { postId, comment };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async ({ id, content, postId }: { id: string; content: string; postId: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to update comment");
      }

      const comment = await response.json();
      return { postId, comment };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

export const createReply = createAsyncThunk(
  "comments/createReply",
  async ({ parentCommentId, content }: { parentCommentId: string; content: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/comments/${parentCommentId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to create reply");
      }

      const reply = await response.json();
      return reply;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

export const fetchCommentTree = createAsyncThunk(
  "comments/fetchCommentTree",
  async (postId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/posts/${postId}/comments/tree`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch comment tree");
      }
      const commentTree = await response.json();
      return { postId, commentTree };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async ({ id, postId }: { id: string; postId: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      return { postId, commentId: id };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearComments: (state) => {
      state.comments = {};
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments[action.payload.postId] = action.payload.comments;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        if (!state.comments[postId]) {
          state.comments[postId] = [];
        }
        state.comments[postId].unshift(comment);
      })
      .addCase(createComment.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        if (state.comments[postId]) {
          const index = state.comments[postId].findIndex(c => c.id === comment.id);
          if (index !== -1) {
            state.comments[postId][index] = comment;
          }
        }
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(voteComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        if (state.comments[postId]) {
          const index = state.comments[postId].findIndex(c => c.id === comment.id);
          if (index !== -1) {
            state.comments[postId][index] = comment;
          }
        }
      })
      .addCase(voteComment.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        if (state.comments[postId]) {
          state.comments[postId] = state.comments[postId].filter(c => c.id !== commentId);
        }
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(createReply.fulfilled, (state, action) => {
        const reply = action.payload;
        // Add reply to flat comments list
        if (state.comments[reply.postId]) {
          state.comments[reply.postId].push(reply);
        }
        // Refresh comment tree by re-fetching
      })
      .addCase(createReply.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchCommentTree.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCommentTree.fulfilled, (state, action) => {
        state.isLoading = false;
        state.commentTrees[action.payload.postId] = action.payload.commentTree;
      })
      .addCase(fetchCommentTree.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;