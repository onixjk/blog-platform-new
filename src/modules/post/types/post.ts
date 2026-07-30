import { ExtendedLikesInfo } from "../../like/types/extended-likes-info";

export type Post = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: Date,
    extendedLikesInfo: ExtendedLikesInfo
};