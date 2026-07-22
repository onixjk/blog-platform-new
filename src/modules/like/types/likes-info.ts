import { LikeStatus } from "./like-status";

export type LikesInfo = {
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatus,
}