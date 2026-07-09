import { Router } from 'express';
import { superAdminGuardMiddleware } from "../../auth/middlewares/super-admin.guard-middleware";
import { getPostListHandler } from "./handlers/get-post-list.handler";
import { getPostHandler } from "./handlers/get-post.handler";
import { createPostHandler } from "./handlers/create-post.handler";
import { updatePostHandler } from "./handlers/update-post.handler";
import { deletePostHandler } from "./handlers/delete-post.handler";
import { idValidation, postIdValidation } from "../../../core/middlewares/validation/params-id.validation-middleware";
import {
    paginationAndSortingValidation
} from "../../../core/middlewares/validation/query-pagination-sorting.validation-middleware";
import { PostSortField } from "../types/input/post-sort-field";
import { postInputValidation } from "../middlewares/post.input-dto.validation-middlewares";
import {
    inputValidationResultMiddleware
} from "../../../core/middlewares/validation/input-validation-result.middleware";
import { CommentSortField } from "../../comment/types/input/comment-sort-field";
import { getPostCommentListHandler } from "./handlers/get-post-comments-list.handler";
import { accessTokenGuard } from "../../auth/middlewares/access-token.guard";
import { commentInputValidation } from "../../comment/middlewares/comment.input-dto.validation-middlewares";
import { createPostCommentHandler } from "./handlers/create-post-comment.handler";
import { container } from "../../../composition-root";
import { PostQueryRepository } from "../repositories/post.query.repository";
import PostService from "../application/postService";
import { CommentQueryRepository } from "../../comment/repositories/comment.query.repository";
import { CommentService } from "../../comment/application/comment.service";

export const postRouter = Router({});

const postQueryRepository = container.get(PostQueryRepository);
const postService = container.get(PostService);
const commentQueryRepository = container.get(CommentQueryRepository);
const commentService = container.get(CommentService);


postRouter
    .get('',
        paginationAndSortingValidation(PostSortField),
        inputValidationResultMiddleware,
        getPostListHandler(postQueryRepository),
    )

    .get('/:id',
        idValidation,
        inputValidationResultMiddleware,
        getPostHandler(postService, postQueryRepository)
    )

    .get('/:postId/comments',
        postIdValidation,
        paginationAndSortingValidation(CommentSortField),
        inputValidationResultMiddleware,
        getPostCommentListHandler(postService, commentQueryRepository),
    )

    .post('',
        superAdminGuardMiddleware,
        postInputValidation,
        inputValidationResultMiddleware,
        createPostHandler(postService, postQueryRepository),
    )

    .post('/:postId/comments',
        accessTokenGuard,
        commentInputValidation,
        inputValidationResultMiddleware,
        createPostCommentHandler(commentService, commentQueryRepository),
    )

    .put('/:id',
        superAdminGuardMiddleware,
        idValidation,
        postInputValidation,
        inputValidationResultMiddleware,
        updatePostHandler(postService),
    )

    .delete('/:id',
        superAdminGuardMiddleware,
        idValidation,
        inputValidationResultMiddleware,
        deletePostHandler(postService),
    );