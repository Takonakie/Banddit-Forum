import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest } from "../lib/queryClient";

interface User {
  id: string;
  username: string;
  email: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  votes: number;
  userVote?: number;
  createdAt: string;
  updatedAt: string;
  author: User;
}

interface PostsState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalPosts: number;
}

const initialState: PostsState = {
  posts: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalPosts: 0,
};

// Async thunks
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}) => {
    const response = await apiRequest("GET", `/api/posts?page=${page}&limit=${limit}`);
    return await response.json();
  }
);

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData: { title: string; content: string }) => {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });
    
    if (!response.ok) {
      throw new Error("Failed to create post");
    }
    
    return await response.json();
  }
);

export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async ({ id, ...postData }: { id: string; title: string; content: string }) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });
    
    if (!response.ok) {
      throw new Error("Failed to update post");
    }
    
    return await response.json();
  }
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (id: string) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/posts/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete post");
    }
    
    return id;
  }
);

export const votePost = createAsyncThunk(
  "posts/votePost",
  async ({ id, votes, voteType }: { id: string; votes: number; voteType: number }) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/posts/${id}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ voteType }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to vote on post");
    }
    
    return await response.json();
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPosts: (state) => {
      state.posts = [];
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.posts;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalPosts = action.payload.totalPosts;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch posts";
      })
      .addCase(createPost.fulfilled, (state, action) => {
        // Don't manually add to posts array, let pagination handle it
        // The UI will refresh by fetching the first page
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(post => post.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post.id !== action.payload);
      })
      .addCase(votePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(post => post.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      });
  },
});

export const { clearError, clearPosts } = postsSlice.actions;
export default postsSlice.reducer;
