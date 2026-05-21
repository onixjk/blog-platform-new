import {CommentatorInfo} from "./commentator-info";

export type Comment = {
    postId: string,
    content: string,
    commentatorInfo: CommentatorInfo,
    createdAt: string,
}