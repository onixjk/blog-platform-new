import {Router} from "express";
import {inputValidationResultMiddleware} from "../../../core/middlewares/validation/input-validation-result.middleware";
import {idValidation} from "../../../core/middlewares/validation/params-id.validation-middleware";
import {getCommentHandler} from "./handlers/get-comment.handler";
import updateCommentHandler from "./handlers/update-comment.handler";
import {deleteCommentHandler} from "./handlers/delete-comment.handler";
import {commentInputValidation} from "../middlewares/comment.input-dto.validation-middlewares";
import {accessTokenGuard} from "../../../auth/middlewares/access.token.guard";

export const commentRouter = Router({});

commentRouter
    .get('/:id',
        idValidation,
        inputValidationResultMiddleware,
        getCommentHandler
    )


    .put('/:id',
        idValidation,
        accessTokenGuard,
        commentInputValidation,
        inputValidationResultMiddleware,
        updateCommentHandler,
    )

    .delete('/:id',
        idValidation,
        accessTokenGuard,
        inputValidationResultMiddleware,
        deleteCommentHandler,
    );