import {Router} from 'express';
import {superAdminGuardMiddleware} from "../../../auth/middlewares/super-admin.guard-middleware";
import {getPostListHandler} from "./handlers/get-post-list.handler";
import {getPostHandler} from "./handlers/get-post.handler";
import {createPostHandler} from "./handlers/create-post.handler";
import {updatePostHandler} from "./handlers/update-post.handler";
import {deletePostHandler} from "./handlers/delete-post.handler";
import {idValidation, postIdValidation} from "../../../core/middlewares/validation/params-id.validation-middleware";
import {
    paginationAndSortingValidation
} from "../../../core/middlewares/validation/query-pagination-sorting.validation-middleware";
import {PostSortField} from "./input/post-sort-field";
import {postInputValidation} from "../middlewares/post.input-dto.validation-middlewares";
import {inputValidationResultMiddleware} from "../../../core/middlewares/validation/input-validation-result.middleware";
import {CommentSortField} from "../../comment/routes/input/comment-sort-field";
import {getPostCommentListHandler} from "./handlers/get-post-comments-list.handler";
import {accessTokenGuard} from "../../../auth/middlewares/access.token.guard";
import {commentInputValidation} from "../../comment/middlewares/comment.input-dto.validation-middlewares";
import {createPostCommentHandler} from "./handlers/create-post-comment.handler";

export const postRouter = Router({});

postRouter
    .get('',
        paginationAndSortingValidation(PostSortField),
        inputValidationResultMiddleware,
        getPostListHandler,
    )

    .get('/:id',
        idValidation,
        inputValidationResultMiddleware,
        getPostHandler
    )

    .get('/:postId/comments',
        postIdValidation,
        paginationAndSortingValidation(CommentSortField),
        inputValidationResultMiddleware,
        getPostCommentListHandler,
    )

    .post('',
        superAdminGuardMiddleware,
        postInputValidation,
        inputValidationResultMiddleware,
        createPostHandler,
    )

    .post('/:postId/comments',
        accessTokenGuard,
        commentInputValidation,
        inputValidationResultMiddleware,
        createPostCommentHandler,
    )

    .put('/:id',
        superAdminGuardMiddleware,
        idValidation,
        postInputValidation,
        inputValidationResultMiddleware,
        updatePostHandler,
    )

    .delete('/:id',
        superAdminGuardMiddleware,
        idValidation,
        inputValidationResultMiddleware,
        deletePostHandler,
    );