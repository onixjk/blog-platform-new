import { Request, Response } from "express";
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { BlogPostInputDto } from "../../../post/types/input/blog-post.input-dto";
import PostService from "../../../post/application/postService";
import { PostQueryRepository } from "../../../post/repositories/post.query.repository";

export const createBlogPostHandler = (
    postService: PostService,
    postQueryRepository: PostQueryRepository
) => async (
    req: Request<{ blogId: string }, {}, BlogPostInputDto>,
    res: Response
) => {
    try {
        const { blogId } = req.params;

        const postData = { ...req.body, blogId };
        const createdPostId = await postService.create(postData);

        await postService.findByIdOrFail(createdPostId);

        const postOutput = await postQueryRepository.findById(createdPostId);

        res.status(HttpStatuses.Created_201).send(postOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}