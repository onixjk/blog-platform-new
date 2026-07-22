import { LikesInfo } from "../../../like/types/likes-info";

export type CommentOutput = {
    id: string,
    content: string,
    commentatorInfo: {
        userId: string,
        userLogin: string,
    }
    createdAt: string,
    likesInfo: LikesInfo,
}