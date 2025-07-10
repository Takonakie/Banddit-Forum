import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, ChevronUp, ChevronDown, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface MockUser {
  id: string;
  username: string;
  email: string;
}

interface MockComment {
  id: string;
  content: string;
  authorId: string;
  votes: number;
  userVote?: number;
  createdAt: string;
  author: MockUser;
  parentId?: string | null;
}

interface ThreadedCommentProps {
  comment: MockComment;
  depth: number;
  allComments: MockComment[];
  formatTimeAgo: (date: string) => string;
}

function ThreadedComment({ comment, depth, allComments, formatTimeAgo }: ThreadedCommentProps) {
  const replies = allComments.filter(c => c.parentId === comment.id);
  const maxDepth = 6;
  const indentSize = Math.min(depth * 20, 120);
  
  return (
    <div className="relative">
      {/* Threading lines */}
      {depth > 0 && (
        <>
          <div 
            className="absolute top-0 bottom-0 w-px bg-gray-300"
            style={{ left: `${indentSize - 12}px` }}
          />
          <div 
            className="absolute top-6 w-3 h-px bg-gray-300"
            style={{ left: `${indentSize - 12}px` }}
          />
        </>
      )}
      
      {/* Comment container */}
      <div 
        className="flex space-x-3 mb-4"
        style={{ marginLeft: `${indentSize}px` }}
      >
        {/* Vote Section */}
        <div className="flex flex-col items-center space-y-1">
          <button className="p-1 hover:bg-muted rounded transition-colors">
            <ChevronUp size={16} className={`transition-colors ${
              comment.userVote === 1 
                ? 'text-red-500' 
                : 'text-muted-foreground hover:text-red-500'
            }`} />
          </button>
          <span className={`text-xs font-medium ${
            comment.votes > 0 ? 'text-red-500' : 
            comment.votes < 0 ? 'text-blue-500' : 'text-muted-foreground'
          }`}>
            {comment.votes}
          </span>
          <button className="p-1 hover:bg-muted rounded transition-colors">
            <ChevronDown size={16} className={`transition-colors ${
              comment.userVote === -1 
                ? 'text-blue-500' 
                : 'text-muted-foreground hover:text-blue-500'
            }`} />
          </button>
        </div>

        {/* Comment Content */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-foreground">u/{comment.author.username}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
          </div>
          
          <p className="text-sm text-foreground mb-2">{comment.content}</p>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <MessageCircle size={12} />
              <span>Reply</span>
            </button>
            <button className="text-muted-foreground hover:text-reddit-blue transition-colors">
              <Edit size={12} />
            </button>
            <button className="text-muted-foreground hover:text-red-600 transition-colors">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Nested Replies */}
      {replies.map((reply) => (
        <ThreadedComment
          key={reply.id}
          comment={reply}
          depth={Math.min(depth + 1, maxDepth)}
          allComments={allComments}
          formatTimeAgo={formatTimeAgo}
        />
      ))}
    </div>
  );
}

export default function PrototypePost() {
  const [showComments, setShowComments] = useState(true);
  
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const mockPost = {
    id: "prototype-post",
    title: "🧵 PROTOTYPE: Threaded Comments Demo - How Reply Threading Would Look",
    content: "This is a prototype post to demonstrate how threaded comments with visual lines would appear in the UI. Click the comments below to see the threading in action!",
    author: { username: "prototype_demo", id: "demo-user" },
    votes: 42,
    userVote: 1,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  };

  const mockComments: MockComment[] = [
    {
      id: "1",
      content: "This is the main comment about the post. What do you all think about this threading system?",
      authorId: "user1",
      votes: 12,
      userVote: 1,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      author: { id: "user1", username: "john_doe", email: "john@example.com" },
      parentId: null
    },
    {
      id: "2",
      content: "Great point! I totally agree with this perspective. The visual lines make it much easier to follow conversations.",
      authorId: "user2",
      votes: 8,
      userVote: 0,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      author: { id: "user2", username: "alice_smith", email: "alice@example.com" },
      parentId: "1"
    },
    {
      id: "3",
      content: "Thanks! Here's some additional detail on why I think this threading approach works well for nested discussions...",
      authorId: "user3",
      votes: 5,
      userVote: 0,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      author: { id: "user3", username: "bob_wilson", email: "bob@example.com" },
      parentId: "2"
    },
    {
      id: "4",
      content: "I have to disagree with this opinion. Here's why I think a different approach might be better...",
      authorId: "user4",
      votes: -2,
      userVote: -1,
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      author: { id: "user4", username: "charlie_brown", email: "charlie@example.com" },
      parentId: "1"
    },
    {
      id: "5",
      content: "Can you explain your reasoning? I'm curious to understand your perspective better.",
      authorId: "user5",
      votes: 7,
      userVote: 1,
      createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      author: { id: "user5", username: "dave_jones", email: "dave@example.com" },
      parentId: "4"
    },
    {
      id: "6",
      content: "Here's my perspective on this whole discussion. I think both sides have valid points...",
      authorId: "user6",
      votes: 3,
      userVote: 0,
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      author: { id: "user6", username: "eve_taylor", email: "eve@example.com" },
      parentId: "4"
    },
    {
      id: "7",
      content: "This is another top-level comment with completely different thoughts on the threading system.",
      authorId: "user7",
      votes: 9,
      userVote: 0,
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      author: { id: "user7", username: "frank_miller", email: "frank@example.com" },
      parentId: null
    },
    {
      id: "8",
      content: "Interesting take! I hadn't considered that angle. The indentation really helps show the conversation flow.",
      authorId: "user8",
      votes: 4,
      userVote: 0,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      author: { id: "user8", username: "grace_lee", email: "grace@example.com" },
      parentId: "7"
    },
    {
      id: "9",
      content: "Exactly! And with the visual lines, you can easily see which comment is replying to what.",
      authorId: "user9",
      votes: 2,
      userVote: 0,
      createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      author: { id: "user9", username: "henry_clark", email: "henry@example.com" },
      parentId: "8"
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-reddit-border p-4 mb-4">
      {/* Post Header */}
      <div className="flex items-start space-x-3">
        {/* Vote Section */}
        <div className="flex flex-col items-center space-y-1">
          <button className="p-1 hover:bg-muted rounded transition-colors">
            <ArrowUp size={18} className={`transition-colors ${
              mockPost.userVote === 1 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-muted-foreground hover:text-red-500'
            }`} />
          </button>
          <span className={`text-sm font-medium ${
            mockPost.votes > 0 ? 'text-red-500' :
            mockPost.votes < 0 ? 'text-blue-500' : 'text-foreground'
          }`}>{mockPost.votes}</span>
          <button className="p-1 hover:bg-muted rounded transition-colors">
            <ArrowDown size={18} className={`transition-colors ${
              mockPost.userVote === -1 
                ? 'text-blue-500 hover:text-blue-600' 
                : 'text-muted-foreground hover:text-blue-500'
            }`} />
          </button>
        </div>

        {/* Post Content */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
            <span>b/programming</span>
            <span>•</span>
            <span>Posted by</span>
            <span>u/{mockPost.author.username}</span>
            <span>{formatTimeAgo(mockPost.createdAt)}</span>
          </div>

          <h2 className="text-lg font-semibold text-foreground mb-2">{mockPost.title}</h2>
          <p className="text-sm text-muted-foreground mb-4">{mockPost.content}</p>

          {/* Post Actions */}
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 hover:text-foreground transition-colors"
            >
              <MessageCircle size={16} />
              <span>{mockComments.length} Comments</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-reddit-border mt-4 pt-4">
          {/* Comment Form */}
          <div className="mb-4">
            <button className="w-full text-left p-3 bg-input rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              What are your thoughts?
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {mockComments.filter(c => !c.parentId).map((comment) => (
              <ThreadedComment 
                key={comment.id} 
                comment={comment} 
                depth={0}
                allComments={mockComments}
                formatTimeAgo={formatTimeAgo}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}