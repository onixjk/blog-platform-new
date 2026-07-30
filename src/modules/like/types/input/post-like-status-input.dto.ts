import { LikeStatus } from "../like-status";

export type PostLikeStatusInputDto = {
    postId: string,
    userId: string,
    likeStatus: LikeStatus,
}