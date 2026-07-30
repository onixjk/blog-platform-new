import { ExtendedLikesInfo } from "../../../like/types/extended-likes-info";

export type PostOutput = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string,
    extendedLikesInfo: ExtendedLikesInfo,
};