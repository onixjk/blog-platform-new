import { LikeStatus } from "./like-status";

export type CommentLike = {
    commentId: string,
    userId: string,
    status: LikeStatus,
    createdAt: string;
}