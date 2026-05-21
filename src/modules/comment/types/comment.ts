import {CommentatorInfo} from "./commentator-info";

export type Comment = {
    content: string,
    commentatorInfo: CommentatorInfo,
    createdAt: string,
}