import {CommentatorInfo} from "../../types/commentator-info";

export type CommentInputDto = {
    userId: string,
    content: string,
    commentatorInfo: CommentatorInfo,
    createdAt: string,
}