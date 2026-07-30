import { LikeStatus } from "./like-status";

export type LikeComments = {
    commentId: string,
    userId: string,
    status: LikeStatus,
    createdAt: string;
}