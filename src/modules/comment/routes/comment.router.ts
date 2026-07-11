import { Router } from "express";
import {
    inputValidationResultMiddleware
} from "../../../core/middlewares/validation/input-validation-result.middleware";
import { idValidation } from "../../../core/middlewares/validation/params-id.validation-middleware";
import { commentInputValidation } from "../middlewares/comment.input-dto.validation-middlewares";
import { accessTokenGuard } from "../../auth/middlewares/access-token.guard";
import { container } from "../../../composition-root";
import { CommentController } from "../controllers/comment.controller";

export const commentRouter = Router({});

const commentController = container.get(CommentController);


commentRouter
    .get('/:id',
        idValidation,
        inputValidationResultMiddleware,
        commentController.getComment.bind(commentController)
    )

    .put('/:id',
        idValidation,
        accessTokenGuard,
        commentInputValidation,
        inputValidationResultMiddleware,
        commentController.updateComment.bind(commentController),
    )

    .delete('/:id',
        idValidation,
        accessTokenGuard,
        inputValidationResultMiddleware,
        commentController.deleteComment.bind(commentController),
    );