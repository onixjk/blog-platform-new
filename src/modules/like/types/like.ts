import { LikeStatus } from "./like-status";

export type Like = {
    commentId: string,
    userId: string,
    status: LikeStatus,
}