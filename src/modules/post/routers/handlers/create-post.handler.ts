import {Request, Response} from "express";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {postsService} from "../../application/posts.service";
import {mapToPostOutput} from "../mapers/map-to-post-output.util";
import {HttpStatus} from "../../../../core/types/http-statuses";
import {PostInputDto} from "../input/post.input-dto";

export async function createPostHandler(
    req: Request<{}, {}, PostInputDto>,
    res: Response
) {
    try {
        const createdPostId = await postsService.create(req.body);

        const createdPost = await postsService.findByIdOrFail(createdPostId);
        const postOutput = mapToPostOutput(createdPost);

        res.status(HttpStatus.Created_201).send(postOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}