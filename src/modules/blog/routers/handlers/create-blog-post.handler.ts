import {Request, Response} from "express";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {HttpStatus} from "../../../../core/types/http-statuses";
import {PostInputDto} from "../../../post/routers/input/post.input-dto";
import {postsService} from "../../../post/application/posts.service";
import {mapToPostOutput} from "../../../post/routers/mapers/map-to-post-output.util";

export async function createBlogPostHandler(
    req: Request<{}, {}, PostInputDto>,
    res: Response
) {
    try {
        const createdPostId = await postsService.create(
            req.body,
        );

        const createdPost = await postsService.findByIdOrFail(createdPostId);
        const postOutput = mapToPostOutput(createdPost);

        res.status(HttpStatus.Created_201).send(postOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}