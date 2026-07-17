import { inject, injectable } from "inversify";
import { BlogService } from "../application/blog.service";
import { BlogQueryRepository } from "../repositories/blog.query.repository";
import { Request, Response } from "express";
import { BlogInputDto } from "../types/input/blog.input-dto";
import { HttpStatuses } from "../../../core/types/http-statuses";
import { PostService } from "../../post/application/postService";
import { PostQueryRepository } from "../../post/repositories/post.query.repository";
import { BlogPostInputDto } from "../../post/types/input/blog-post.input-dto";
import { matchedData } from "express-validator";
import { BlogQueryInput } from "../types/input/blog-query.input";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/helpers/set-default-sort-and-pagination";
import { PostQueryInput } from "../../post/types/input/post-query.input";
import { resultCodeToHttpException } from "../../../core/result/resultCodeToHttpException";
import { ResultStatus } from "../../../core/result/resultCode";

@injectable()
export class BlogController {

    constructor(
        @inject(BlogService) private blogService: BlogService,
        @inject(PostService) private postService: PostService,
        @inject(BlogQueryRepository) private blogQueryRepository: BlogQueryRepository,
        @inject(PostQueryRepository) private postQueryRepository: PostQueryRepository,
    ) {}

    async getBlog(req: Request<{ id: string }>, res: Response) {

        const id = req.params.id;
        if (!id) return res.sendStatus(HttpStatuses.NotFound_404);

        const blogOutput = await this.blogQueryRepository.findById(id);
        if (!blogOutput) return res.sendStatus(HttpStatuses.NotFound_404);

        res.status(HttpStatuses.Ok_200).send(blogOutput);
    }

    async getBlogList(req: Request, res: Response) {

        const sanitizedQuery = matchedData<BlogQueryInput>(req, {
            locations: ['query'],
            includeOptionals: true,
        });
        const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

        const blogsListOutput = await this.blogQueryRepository.findMany(queryInput);

        res.status(HttpStatuses.Ok_200).send(blogsListOutput);
    }

    async getBlogPostList(req: Request<{ blogId: string }, {}, {}, {}>, res: Response) {

        const blogId = req.params.blogId;
        if (!blogId) return res.sendStatus(HttpStatuses.NotFound_404);

        const blog = await this.blogQueryRepository.findById(blogId);
        if (!blog) return res.sendStatus(HttpStatuses.NotFound_404);

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
    }

    async createBlog(req: Request<{}, {}, BlogInputDto>, res: Response) {

        const createdBlogId = await this.blogService.create(req.body);
        if (createdBlogId.status !== ResultStatus.Success || !createdBlogId.data) {
            return res
                .status(resultCodeToHttpException(createdBlogId.status))
                .send({ errorsMessages: createdBlogId.extensions });
        }

        const blogOutput = await this.blogQueryRepository.findById(createdBlogId.data);
        if (!blogOutput) return res.sendStatus(HttpStatuses.BadRequest_400);

        res.status(HttpStatuses.Created_201).send(blogOutput);
    }

    async createBlogPost(req: Request<{ blogId: string }, {}, BlogPostInputDto>, res: Response) {

        const { blogId } = req.params;
        if (!blogId) return res.sendStatus(HttpStatuses.NotFound_404);

        const blog = await this.blogQueryRepository.findById(blogId);
        if (!blog) return res.sendStatus(HttpStatuses.NotFound_404);

        const postData = { ...req.body, blogId };

        const createdPostId = await this.postService.create(postData);
        if (createdPostId.status !== ResultStatus.Success || !createdPostId.data) {
            return res
                .status(resultCodeToHttpException(createdPostId.status))
                .send({ errorsMessages: createdPostId.extensions });
        }

        const postOutput = await this.postQueryRepository.findById(createdPostId.data);
        if (!postOutput) return res.sendStatus(HttpStatuses.BadRequest_400);

        res.status(HttpStatuses.Created_201).send(postOutput);
    }

    async updateBlog(req: Request<{ id: string }, {}, BlogInputDto>, res: Response) {

        const id = req.params.id;
        if (!id) return res.sendStatus(HttpStatuses.NotFound_404);

        const result = await this.blogService.update(id, req.body);
        if (result.status !== ResultStatus.Success) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send({ errorsMessages: result.extensions });
        }

        res.sendStatus(HttpStatuses.NoContent_204)
    }

    async deleteBlog(req: Request<{ id: string }>, res: Response) {

        const id = req.params.id;
        if (!id) return res.sendStatus(HttpStatuses.NotFound_404);

        const result = await this.blogService.delete(id);
        if (result.status !== ResultStatus.Success || !result.data) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send({ errorsMessages: result.extensions });
        }

        res.sendStatus(HttpStatuses.NoContent_204);
    }
}