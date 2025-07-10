import { Button } from "@/components/ui/button";
import { Search, Plus, ChevronDown } from "lucide-react";
import BandditLogo from "../assets/Banddit.png";

interface User {
  id: string;
  username: string;
  email: string;
}

interface HeaderProps {
  user: User;
  onCreatePost: () => void;
  onProfileClick: () => void;
}

export default function Header({ user, onCreatePost, onProfileClick }: HeaderProps) {
  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-card border-b border-reddit-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img src={BandditLogo} alt="Banddit" className="w-14 h-14" />
              <span className="text-xl font-bold text-foreground">Banddit</span>
            </div>
            <div className="hidden md:flex bg-input rounded-lg px-4 py-2 w-96 items-center">
              <Search size={16} className="text-muted-foreground mr-2" />
              <input
                type="text"
                placeholder="Search Banddit"
                className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={onCreatePost}
              className="bg-reddit-orange text-white hover:bg-orange-600 rounded-full flex items-center gap-2"
            >
              <Plus size={16} />Create Post
            </Button>
            <div className="relative">
              <button
                onClick={onProfileClick}
                className="flex items-center space-x-2 bg-muted px-3 py-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="w-8 h-8 bg-reddit-orange rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {getUserInitials(user.username)}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-foreground">
                  {user.username}
                </span>
                <ChevronDown size={12} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
