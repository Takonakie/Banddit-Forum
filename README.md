# Banddit - Reddit Clone Community Forum

A modern, full-stack Reddit-style community forum built with React, TypeScript, Express.js, and MongoDB. Features a sleek dark theme interface with real-time interactions.

## 🚀 Features

- **User Authentication**: Secure JWT-based registration and login
- **Post Management**: Create, read, update, and delete posts with edit indicators
- **Comment System**: Full CRUD operations for comments with nested display
- **Voting System**: Upvote and downvote posts and comments
- **Dark Theme**: Modern dark UI with responsive design
- **Real-time Updates**: Live post and comment interactions
- **MongoDB Integration**: Persistent data storage with proper relationships
- **RESTful API**: Complete CRUD operations for all entities

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Redux Toolkit** - State management
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icon library
- **Vite** - Fast build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
Banddit/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store and slices
│   │   ├── lib/           # Utility functions
│   │   └── assets/        # Static assets
│   └── index.html
├── server/                # Backend Express application
│   ├── models/           # MongoDB models
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   ├── db.ts            # Database connection
│   └── index.ts         # Server entry point
├── shared/               # Shared types and schemas
└── package.json
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Takonakie/Bandit-Community-Forum.git
   cd RedditCloneLite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/banddit
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

4. **Start MongoDB**
   - Local: Start your MongoDB service
   - Cloud: Ensure your MongoDB Atlas connection is active

### Running the Application

1. **Build the client**
   ```bash
   npm run build
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Frontend: `http://localhost:5000`
   - API: `http://localhost:5000/api`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get specific post
- `POST /api/posts` - Create new post (auth required)
- `PUT /api/posts/:id` - Update post (auth required)
- `DELETE /api/posts/:id` - Delete post (auth required)
- `POST /api/posts/:id/vote` - Vote on post (auth required)

### Comments
- `GET /api/posts/:postId/comments` - Get comments for a post
- `POST /api/posts/:postId/comments` - Create new comment (auth required)
- `PUT /api/comments/:id` - Update comment (auth required)
- `DELETE /api/comments/:id` - Delete comment (auth required)
- `POST /api/comments/:id/vote` - Vote on comment (auth required)

## 🧪 Testing with Postman

1. Register/Login to get JWT token
2. Use token in Authorization header: `Bearer YOUR_TOKEN`
3. Test all CRUD operations on posts
4. Verify voting functionality

## 🎨 UI Components

- **Header**: Navigation with logo, search, and user profile
- **PostItem**: Individual post display with voting and comment toggle
- **CommentSection**: Nested comment display with voting and CRUD operations
- **CreatePostModal**: Post creation/editing form
- **ProfileModal**: User profile management
- **Popular Communities**: Sidebar community list
- **Spinner**: Loading states with theme-aware styling

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking

## 🌟 Key Features Implemented

- ✅ User registration and authentication
- ✅ JWT token-based security
- ✅ Post CRUD operations with edit indicators
- ✅ Comment system with full CRUD operations
- ✅ Voting system for posts and comments
- ✅ Dark theme UI with consistent styling
- ✅ Responsive design for all screen sizes
- ✅ MongoDB integration with proper relationships
- ✅ TypeScript throughout for type safety
- ✅ Error handling and loading states
- ✅ Input validation and authorization
- ✅ Real-time comment counts and updates
- ✅ Edit indicators for modified content
- ✅ State management with Redux Toolkit

## 🚀 Future Enhancements

- [ ] Nested comment replies
- [ ] Real-time notifications
- [ ] Image upload support
- [ ] Search functionality
- [ ] Advanced user profiles
- [ ] Community creation and management
- [ ] Email verification
- [ ] Comment sorting options
- [ ] Post categories and tags
- [ ] User karma system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Developed by [Takonakie](https://github.com/Takonakie)

---

**Banddit** - Building communities, one post at a time! 🚀