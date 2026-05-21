import {CommentatorInfo} from "../../types/commentator-info";

export type CommentInputDto = {
    postId: string;
    userId: string,
    content: string,
    commentatorInfo: CommentatorInfo,
    createdAt: string,
}