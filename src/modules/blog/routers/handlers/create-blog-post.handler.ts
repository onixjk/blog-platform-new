import {Request, Response} from "express";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {HttpStatus} from "../../../../core/types/http-statuses";
import {postsService} from "../../../post/application/posts.service";
import {mapToPostOutput} from "../../../post/routers/mapers/map-to-post-output.util";
import {BlogPostInputDto} from "../../../post/routers/input/blog-post.input-dto";

export async function createBlogPostHandler(
    req: Request<{blogId: string}, {}, BlogPostInputDto>,
    res: Response
) {
    try {

        const postData = { ...req.body, blogId: req.body.blogId };
        const createdPostId = await postsService.create(postData);

        const createdPost = await postsService.findByIdOrFail(createdPostId);
        const postOutput = mapToPostOutput(createdPost);

        res.status(HttpStatus.Created_201).send(postOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}