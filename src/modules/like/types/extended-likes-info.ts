import { LikeStatus } from "./like-status";

export type NewestLike = {
    addedAt: string;
    userId: string;
    login: string;
};

export type ExtendedLikesInfo = {
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatus,
    newestLikes: NewestLike[];
}