import { LikeStatus } from "./like-status";

export type PostLike = {
    postId: string;
    userId: string;
    login: string;
    status: LikeStatus;
    createdAt: Date;
}