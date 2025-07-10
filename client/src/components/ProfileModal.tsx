import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { logout } from "../store/authSlice";
import { clearPosts } from "../store/postsSlice";
import { clearComments } from "../store/commentsSlice";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Settings, Moon, LogOut } from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearPosts());
    dispatch(clearComments());
    onClose();
  };

  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="p-6 border-b border-reddit-border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-reddit-orange rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {getUserInitials(user.username)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{user.username}</h3>
              <p className="text-sm text-muted-foreground">u/{user.username}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-foreground">0</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">0</div>
              <div className="text-xs text-muted-foreground">Karma</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">0d</div>
              <div className="text-xs text-muted-foreground">Cake Day</div>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-3">
          <button className="w-full flex items-center space-x-3 p-3 hover:bg-muted rounded-lg transition-colors text-foreground">
            <User size={16} className="text-muted-foreground" />
            <span>My Profile</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-3 hover:bg-muted rounded-lg transition-colors text-foreground">
            <Settings size={16} className="text-muted-foreground" />
            <span>User Settings</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-3 hover:bg-muted rounded-lg transition-colors text-foreground">
            <Moon size={16} className="text-muted-foreground" />
            <span>Dark Mode</span>
          </button>
          <hr className="border-reddit-border" />
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full flex items-center space-x-3 p-3 hover:bg-red-900 text-red-400 hover:text-red-300 justify-start"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
