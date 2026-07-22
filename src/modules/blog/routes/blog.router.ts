import { Router } from 'express';
import { blogIdValidation, idValidation, } from "../../../core/middlewares/validation/params-id.validation-middleware";
import {
    paginationAndSortingValidation
} from "../../../core/middlewares/validation/query-pagination-sorting.validation-middleware";
import { BlogSortField } from "../types/input/blog-sort-field";
import { PostSortField } from "../../post/types/input/post-sort-field";
import { blogInputValidation } from "../middlewares/blog.input-dto.validation-middlewares";
import { blogPostInputValidation } from "../../post/middlewares/post.input-dto.validation-middlewares";
import {
    inputValidationResultMiddleware
} from "../../../core/middlewares/validation/input-validation-result.middleware";
import { container } from "../../../composition-root";
import { BlogController } from "../controllers/blog.controller";
import { superAdminGuardMiddleware } from "../../auth/middlewares/super-admin.guard";

export const blogRouter = Router({});

const blogController = container.get(BlogController);

blogRouter
    .get('',
        paginationAndSortingValidation(BlogSortField),
        inputValidationResultMiddleware,
        blogController.getBlogList.bind(blogController),
    )

    .get('/:id',
        idValidation,
        inputValidationResultMiddleware,
        blogController.getBlog.bind(blogController),
    )

    .get('/:blogId/posts',
        blogIdValidation,
        paginationAndSortingValidation(PostSortField),
        inputValidationResultMiddleware,
        blogController.getBlogPostList.bind(blogController),
    )

    .post('',
        superAdminGuardMiddleware,
        blogInputValidation,
        inputValidationResultMiddleware,
        blogController.createBlog.bind(blogController),
    )

    .post('/:blogId/posts',
        superAdminGuardMiddleware,
        blogPostInputValidation,
        inputValidationResultMiddleware,
        blogController.createBlogPost.bind(blogController),
    )

    .put('/:id',
        superAdminGuardMiddleware,
        idValidation,
        blogInputValidation,
        inputValidationResultMiddleware,
        blogController.updateBlog.bind(blogController),
    )

    .delete('/:id',
        superAdminGuardMiddleware,
        idValidation,
        inputValidationResultMiddleware,
        blogController.deleteBlog.bind(blogController),
    );