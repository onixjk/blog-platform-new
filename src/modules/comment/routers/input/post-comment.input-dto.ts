import {CommentatorInfo} from "../../types/commentator-info";

export type PostCommentInputDto = {
    content: string,
    commentatorInfo: CommentatorInfo,
    createdAt: string,
};
