import {Router} from "express";
import {inputValidationResultMiddleware} from "../../../core/middlewares/validation/input-validation-result.middleware";
import {idValidation} from "../../../core/middlewares/validation/params-id.validation-middleware";
import {getCommentHandler} from "./handlers/get-comment.handler";
import {updateCommentHandler} from "./handlers/update-comment.handler";
import {deleteCommentHandler} from "./handlers/delete-comment.handler";
import {commentInputValidation} from "../middlewares/comment.input-dto.validation-middlewares";

export const postRouter = Router({});

postRouter
    .get('/:id',
        idValidation,
        inputValidationResultMiddleware,
        getCommentHandler
    )


    .put('/:id',
        idValidation,
        commentInputValidation,
        inputValidationResultMiddleware,
        updateCommentHandler,
    )

    .delete('/:id',
        idValidation,
        inputValidationResultMiddleware,
        deleteCommentHandler,
    );