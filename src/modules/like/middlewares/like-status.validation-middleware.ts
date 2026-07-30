import { body } from "express-validator";
import { LikeStatus } from "../types/like-status";

export const likeStatusValidation = body('likeStatus')
    .isString()
    .isIn([LikeStatus.Like, LikeStatus.Dislike, LikeStatus.None])
    .withMessage('Invalid value');
