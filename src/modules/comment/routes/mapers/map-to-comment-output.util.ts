import { Comment } from "../../types/comment";
import { CommentOutput } from "../../types/output/comment-output";
import { LikeStatus } from "../../../like/types/like-status";

export function mapToCommentOutput(comment: Comment & { _id: any }, myStatus: LikeStatus): CommentOutput {
    return {
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
            likesCount: comment.likesInfo.likesCount,
            dislikesCount: comment.likesInfo.dislikesCount,
            myStatus: myStatus,
        },
    }
}