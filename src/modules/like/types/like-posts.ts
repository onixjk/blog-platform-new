import { LikeStatus } from "./like-status";

export type LikePosts = {
    postId: string;
    userId: string;
    login: string;
    status: LikeStatus;
    createdAt: Date;
}