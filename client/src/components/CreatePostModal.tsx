import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { createPost, updatePost, fetchPosts } from "../store/postsSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Image, Link } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  votes: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    email: string;
  };
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  editPost?: Post;
}

export default function CreatePostModal({ isOpen, onClose, editPost }: CreatePostModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editPost) {
      setTitle(editPost.title);
      setContent(editPost.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [editPost, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      if (editPost) {
        await dispatch(updatePost({ id: editPost.id, title, content }));
      } else {
        await dispatch(createPost({ title, content }));
        // Refresh first page to show new post
        dispatch(fetchPosts({ page: 1, limit: 10 }));
      }
      onClose();
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Error saving post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editPost ? "Edit post" : "Create a post"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="An interesting title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="content">Text</Label>
            <Textarea
              id="content"
              placeholder="Tell us more..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8}
              className="mt-1 resize-none"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="flex items-center space-x-2 px-4 py-2 border border-reddit-border rounded-lg hover:bg-muted transition-colors"
            >
              <Image size={16} className="text-muted-foreground" />
              <span className="text-sm">Add Image</span>
            </button>
            <button
              type="button"
              className="flex items-center space-x-2 px-4 py-2 border border-reddit-border rounded-lg hover:bg-muted transition-colors"
            >
              <Link size={16} className="text-muted-foreground" />
              <span className="text-sm">Add Link</span>
            </button>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-reddit-orange hover:bg-orange-600"
              disabled={isSubmitting || !title.trim() || !content.trim()}
            >
              {isSubmitting ? "Posting..." : editPost ? "Update" : "Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
