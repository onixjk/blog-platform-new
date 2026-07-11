import { inject, injectable } from "inversify";
import { BlogService } from "../application/blog.service";
import { BlogQueryRepository } from "../repositories/blog.query.repository";
import { Request, Response } from "express";
import { BlogInputDto } from "../types/input/blog.input-dto";
import { HttpStatuses } from "../../../core/types/http-statuses";
import { errorsHandler } from "../../../core/errors/errors.handler";
import PostService from "../../post/application/postService";
import { PostQueryRepository } from "../../post/repositories/post.query.repository";
import { BlogPostInputDto } from "../../post/types/input/blog-post.input-dto";
import { matchedData } from "express-validator";
import { BlogQueryInput } from "../types/input/blog-query.input";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/helpers/set-default-sort-and-pagination";
import { PostQueryInput } from "../../post/types/input/post-query.input";

@injectable()
export class BlogController {

    constructor(
        @inject(BlogService) private blogService: BlogService,
        @inject(PostService) private postService: PostService,
        @inject(BlogQueryRepository) private blogQueryRepository: BlogQueryRepository,
        @inject(PostQueryRepository) private postQueryRepository: PostQueryRepository,
    ) {}

    async createBlog(req: Request<{}, {}, BlogInputDto>, res: Response) {
        try {
            const createdBlogId = await this.blogService.create(req.body);

            await this.blogService.findByIdOrFail(createdBlogId);

            const blogOutput = await this.blogQueryRepository.findById(createdBlogId);

            res.status(HttpStatuses.Created_201).send(blogOutput);
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }

    async createBlogPost(req: Request<{ blogId: string }, {}, BlogPostInputDto>, res: Response) {
        try {
            const { blogId } = req.params;

            const postData = { ...req.body, blogId };
            const createdPostId = await this.postService.create(postData);

            await this.postService.findByIdOrFail(createdPostId);

            const postOutput = await this.postQueryRepository.findById(createdPostId);

            res.status(HttpStatuses.Created_201).send(postOutput);
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }

    async deleteBlog(req: Request<{ id: string }>, res: Response) {
        try {
            const id = req.params.id;

            await this.blogService.delete(id);

            res.sendStatus(HttpStatuses.NoContent_204);
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }

    async getBlog(req: Request<{ id: string }>, res: Response) {
        try {
            const id = req.params.id;

            await this.blogService.findByIdOrFail(id);

            const blogOutput = await this.blogQueryRepository.findById(id);

            res.status(HttpStatuses.Ok_200).send(blogOutput);
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }

    async getBlogList(req: Request, res: Response) {
        try {
            const sanitizedQuery = matchedData<BlogQueryInput>(req, {
                locations: ['query'],
                includeOptionals: true,
            });

            const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

            const blogsListOutput = await this.blogQueryRepository.findMany(queryInput);

            res.status(HttpStatuses.Ok_200).send(blogsListOutput);
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }

    async getBlogPostList(req: Request<{ blogId: string }, {}, {}, {}>, res: Response) {
        try {
            const blogId = req.params.blogId;
            await this.blogService.findByIdOrFail(blogId);

            const sanitizedQuery = matchedData<PostQueryInput>(req, {
                locations: ['query'],
                includeOptionals: true,
            });

            const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

            const postListOutput = await this.postQueryRepository.findPostsByBlog(
                queryInput,
                blogId,
            );

            res.status(HttpStatuses.Ok_200).send(postListOutput);
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }

    async updateBlog(req: Request<{ id: string }, {}, BlogInputDto>, res: Response) {
        try {
            const id = req.params.id;

            await this.blogService.update(id, req.body);

            res.sendStatus(HttpStatuses.NoContent_204)
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }
}