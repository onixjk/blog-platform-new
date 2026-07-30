import { Router } from "express";
import {
    inputValidationResultMiddleware
} from "../../../core/middlewares/validation/input-validation-result.middleware";
import { commentIdValidation } from "../../../core/middlewares/validation/params-id.validation-middleware";
import { commentInputValidation } from "../middlewares/comment.input-dto.validation-middlewares";
import { accessTokenGuard } from "../../auth/middlewares/access-token.guard";
import { container } from "../../../composition-root";
import { CommentController } from "../controllers/comment.controller";
import { guestOrUserAuthMiddleware } from "../../auth/middlewares/guest-or-user-auth.middleware";
import { likeStatusValidation } from "../../like/middlewares/like-status.validation-middleware";

export const commentRouter = Router({});

const commentController = container.get(CommentController);


commentRouter
    .get('/:commentId',
        commentIdValidation,
        inputValidationResultMiddleware,
        guestOrUserAuthMiddleware,
        commentController.getComment.bind(commentController)
    )

    .put('/:commentId',
        commentIdValidation,
        accessTokenGuard,
        commentInputValidation,
        inputValidationResultMiddleware,
        commentController.updateComment.bind(commentController),
    )

    .put('/:commentId/like-status',
        commentIdValidation,
        accessTokenGuard,
        likeStatusValidation,
        inputValidationResultMiddleware,
        commentController.updateLikeStatus.bind(commentController),
    )

    .delete('/:commentId',
        commentIdValidation,
        accessTokenGuard,
        inputValidationResultMiddleware,
        commentController.deleteComment.bind(commentController),
    );