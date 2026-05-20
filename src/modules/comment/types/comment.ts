import {CommentatorInfo} from "./commentator-info";

export type Comment = {
    id: string,
    content: string,
    commentatorInfo: CommentatorInfo,
    createdAt: string,
}