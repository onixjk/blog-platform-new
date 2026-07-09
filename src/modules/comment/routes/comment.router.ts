import { Router } from "express";
import {
    inputValidationResultMiddleware
} from "../../../core/middlewares/validation/input-validation-result.middleware";
import { idValidation } from "../../../core/middlewares/validation/params-id.validation-middleware";
import { getCommentHandler } from "./handlers/get-comment.handler";
import { deleteCommentHandler } from "./handlers/delete-comment.handler";
import { commentInputValidation } from "../middlewares/comment.input-dto.validation-middlewares";
import { accessTokenGuard } from "../../auth/middlewares/access-token.guard";
import { updateCommentHandler } from "./handlers/update-comment.handler";
import { container } from "../../../composition-root";
import { CommentQueryRepository } from "../repositories/comment.query.repository";
import { CommentService } from "../application/comment.service";

export const commentRouter = Router({});

const commentQueryRepository = container.get(CommentQueryRepository);
const commentService = container.get(CommentService);

commentRouter
    .get('/:id',
        idValidation,
        inputValidationResultMiddleware,
        getCommentHandler(commentQueryRepository)
    )


    .put('/:id',
        idValidation,
        accessTokenGuard,
        commentInputValidation,
        inputValidationResultMiddleware,
        updateCommentHandler(commentService),
    )

    .delete('/:id',
        idValidation,
        accessTokenGuard,
        inputValidationResultMiddleware,
        deleteCommentHandler(commentService),
    );