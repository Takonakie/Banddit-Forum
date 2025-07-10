import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  votes: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true
});

// Remove pre-save middleware to prevent new posts showing as edited

export default mongoose.models.Post || mongoose.model("Post", postSchema);