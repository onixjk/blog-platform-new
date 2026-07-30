import { LikeStatus } from "../like-status";

export type CommentLikeStatusInputDto = {
    commentId: string,
    userId: string,
    likeStatus: LikeStatus,
}