import { body } from "express-validator";
import { LikeStatus } from "../types/like-status";

export const AlikeStatusValidation = body('likeStatus')
    .isString()
    .isIn([LikeStatus.Like, LikeStatus.Dislike, LikeStatus.None])
    .withMessage('Like status must be Like, Dislike or None');
