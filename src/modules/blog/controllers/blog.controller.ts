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

@injectable()
export class BlogController {

    constructor(
        @inject(BlogService) private blogService: BlogService,
        @inject(PostService) private postService: PostService,
        @inject(BlogQueryRepository) private blogQueryRepository: BlogQueryRepository,
        @inject(PostQueryRepository) private postQueryRepository: PostQueryRepository,
    ) {}

    async createBlogHandler(req: Request<{}, {}, BlogInputDto>, res: Response) {
        try {
            const createdBlogId = await this.blogService.create(req.body);

            await this.blogService.findByIdOrFail(createdBlogId);

            const blogOutput = await this.blogQueryRepository.findById(createdBlogId);

            res.status(HttpStatuses.Created_201).send(blogOutput);
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }

    async createBlogPostHandler(req: Request<{ blogId: string }, {}, BlogPostInputDto>, res: Response) {
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
}