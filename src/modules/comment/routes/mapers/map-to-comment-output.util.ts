import { Comment } from "../../types/comment";
import { CommentOutput } from "../../types/output/comment-output";

export function mapToCommentOutput(comment: Comment & { _id: any }): CommentOutput {
    return {
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin,
        },
        createdAt: comment.createdAt,
    }
}