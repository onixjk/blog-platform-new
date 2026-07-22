import { CommentatorInfo } from "./commentator-info";
import { LikesInfo } from "../../like/types/likes-info";

export type Comment = {
    postId: string,
    content: string,
    commentatorInfo: CommentatorInfo,
    createdAt: string,
    likesInfo: LikesInfo,
}