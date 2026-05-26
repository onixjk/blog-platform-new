import {Request, Response} from "express";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {HttpStatuses} from "../../../../core/types/http-statuses";
import {postsService} from "../../../post/application/posts.service";
import {BlogPostInputDto} from "../../../post/routes/input/blog-post.input-dto";
import {postsQueryRepository} from "../../../post/repositories/posts.query.repository";

export async function createBlogPostHandler(
    req: Request<{blogId: string}, {}, BlogPostInputDto>,
    res: Response
) {
    try {
        const { blogId } = req.params;

        const postData = { ...req.body, blogId };
        const createdPostId = await postsService.create(postData);

        await postsService.findByIdOrFail(createdPostId);

        const postOutput = await postsQueryRepository.findById(createdPostId);

        res.status(HttpStatuses.Created_201).send(postOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}