import { Router } from 'express';
import { getBlogHandler } from "./handlers/get-blog.handler";
import { createBlogHandler } from "./handlers/create-blog.handler";
import { updateBlogHandler } from "./handlers/update-blog.handler";
import { deleteBlogHandler } from "./handlers/delete-blog.handler";
import { blogIdValidation, idValidation, } from "../../../core/middlewares/validation/params-id.validation-middleware";
import { superAdminGuardMiddleware } from "../../auth/middlewares/super-admin.guard-middleware";
import {
    paginationAndSortingValidation
} from "../../../core/middlewares/validation/query-pagination-sorting.validation-middleware";
import { BlogSortField } from "../types/input/blog-sort-field";
import { PostSortField } from "../../post/types/input/post-sort-field";
import { blogInputValidation } from "../middlewares/blog.input-dto.validation-middlewares";
import { blogPostInputValidation } from "../../post/middlewares/post.input-dto.validation-middlewares";
import { createBlogPostHandler } from "./handlers/create-blog-post.handler";
import {
    inputValidationResultMiddleware
} from "../../../core/middlewares/validation/input-validation-result.middleware";
import { getBlogListHandler } from "./handlers/get-blog-list.handler";
import { getBlogPostListHandler } from "./handlers/get-blog-post-list.handler";
import { container } from "../../../composition-root";
import PostService from "../../post/application/postService";
import { PostQueryRepository } from "../../post/repositories/post.query.repository";
import { BlogService } from "../application/blog.service";
import { BlogQueryRepository } from "../repositories/blog.query.repository";

export const blogRouter = Router({});

const postService = container.get(PostService);
const postQueryRepository = container.get(PostQueryRepository);
const blogService = container.get(BlogService);
const blogQueryRepository = container.get(BlogQueryRepository);

blogRouter
    .get('',
        paginationAndSortingValidation(BlogSortField),
        inputValidationResultMiddleware,
        getBlogListHandler(blogQueryRepository),
    )

    .get('/:id',
        idValidation,
        inputValidationResultMiddleware,
        getBlogHandler(blogService, blogQueryRepository),
    )

    .get('/:blogId/posts',
        blogIdValidation,
        paginationAndSortingValidation(PostSortField),
        inputValidationResultMiddleware,
        getBlogPostListHandler(blogService, postQueryRepository),
    )

    .post('',
        superAdminGuardMiddleware,
        blogInputValidation,
        inputValidationResultMiddleware,
        createBlogHandler(blogService, blogQueryRepository),
    )

    .post('/:blogId/posts',
        superAdminGuardMiddleware,
        blogPostInputValidation,
        inputValidationResultMiddleware,
        createBlogPostHandler(postService, postQueryRepository),
    )

    .put('/:id',
        superAdminGuardMiddleware,
        idValidation,
        blogInputValidation,
        inputValidationResultMiddleware,
        updateBlogHandler(blogService),
    )

    .delete('/:id',
        superAdminGuardMiddleware,
        idValidation,
        inputValidationResultMiddleware,
        deleteBlogHandler(blogService),
    );