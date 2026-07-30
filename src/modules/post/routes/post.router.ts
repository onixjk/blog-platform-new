import { Router } from 'express';
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
import { accessTokenGuard } from "../../auth/middlewares/access-token.guard";
import { commentInputValidation } from "../../comment/middlewares/comment.input-dto.validation-middlewares";
import { container } from "../../../composition-root";
import { PostController } from "../controllers/post.controller";
import { superAdminGuardMiddleware } from "../../auth/middlewares/super-admin.guard";
import { guestOrUserAuthMiddleware } from "../../auth/middlewares/guest-or-user-auth.middleware";
import { likeStatusValidation } from "../../like/middlewares/comment-like-status.validation-middleware";

export const postRouter = Router({});

const postController = container.get(PostController);

postRouter
    .get('',
        paginationAndSortingValidation(PostSortField),
        guestOrUserAuthMiddleware,
        inputValidationResultMiddleware,
        postController.getPostList.bind(postController)
    )

    .get('/:id',
        idValidation,
        guestOrUserAuthMiddleware,
        inputValidationResultMiddleware,
        postController.getPost.bind(postController)
    )

    .get('/:postId/comments',
        postIdValidation,
        paginationAndSortingValidation(CommentSortField),
        guestOrUserAuthMiddleware,
        inputValidationResultMiddleware,
        postController.getPostCommentList.bind(postController)
    )

    .post('',
        superAdminGuardMiddleware,
        postInputValidation,
        inputValidationResultMiddleware,
        postController.createPost.bind(postController)
    )

    .post('/:postId/comments',
        accessTokenGuard,
        commentInputValidation,
        inputValidationResultMiddleware,
        postController.createPostComment.bind(postController)
    )

    .put('/:postId/like-status',
        postIdValidation,
        accessTokenGuard,
        likeStatusValidation,
        inputValidationResultMiddleware,
        postController.updateLikeStatus.bind(postController)
    )

    .put('/:id',
        superAdminGuardMiddleware,
        idValidation,
        postInputValidation,
        inputValidationResultMiddleware,
        postController.updatePost.bind(postController)
    )

    .delete('/:id',
        superAdminGuardMiddleware,
        idValidation,
        inputValidationResultMiddleware,
        postController.deletePost.bind(postController)
    );