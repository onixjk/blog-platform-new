import { LikeStatus } from "../like-status";

export type LikeStatusInputDto = {
    commentId: string,
    userId: string,
    likeStatus: LikeStatus,
}