import VoteModel from "../../models/Vote";
import PostModel from "../../models/Post";
import CommentModel from "../../models/Comment";

export class VotingService {
  static async voteOnPost(postId: string, userId: string, voteType: number): Promise<number> {
    // Remove existing vote if any
    await VoteModel.findOneAndDelete({ userId, targetId: postId, targetType: 'Post' });
    
    // Add new vote if not removing (voteType !== 0)
    if (voteType !== 0) {
      await VoteModel.create({ userId, targetId: postId, targetType: 'Post', voteType });
    }
    
    // Calculate total votes
    const upvotes = await VoteModel.countDocuments({ targetId: postId, targetType: 'Post', voteType: 1 });
    const downvotes = await VoteModel.countDocuments({ targetId: postId, targetType: 'Post', voteType: -1 });
    const totalVotes = upvotes - downvotes;
    
    // Update post votes without triggering updatedAt
    await PostModel.findByIdAndUpdate(
      postId,
      { $set: { votes: totalVotes } },
      { timestamps: false }
    );
    
    return totalVotes;
  }

  static async voteOnComment(commentId: string, userId: string, voteType: number): Promise<number> {
    // Remove existing vote if any
    await VoteModel.findOneAndDelete({ userId, targetId: commentId, targetType: 'Comment' });
    
    // Add new vote if not removing (voteType !== 0)
    if (voteType !== 0) {
      await VoteModel.create({ userId, targetId: commentId, targetType: 'Comment', voteType });
    }
    
    // Calculate total votes
    const upvotes = await VoteModel.countDocuments({ targetId: commentId, targetType: 'Comment', voteType: 1 });
    const downvotes = await VoteModel.countDocuments({ targetId: commentId, targetType: 'Comment', voteType: -1 });
    const totalVotes = upvotes - downvotes;
    
    // Update comment votes without triggering updatedAt
    await CommentModel.findByIdAndUpdate(
      commentId,
      { $set: { votes: totalVotes } },
      { timestamps: false }
    );
    
    return totalVotes;
  }

  static async getUserVote(targetId: string, userId: string, targetType: 'Post' | 'Comment'): Promise<number> {
    const vote = await VoteModel.findOne({ userId, targetId, targetType });
    return vote ? vote.voteType : 0;
  }
}