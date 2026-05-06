import {Request, Response} from 'express';
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {postsService} from "../../application/posts.service";
import {mapToPostOutput} from "../mapers/map-to-post-output.util";
import {HttpStatus} from "../../../../core/types/http-statuses";

export async function getPostHandler(
    req: Request<{ id: string }>,
    res: Response
) {
    try {
        const id = req.params.id;
        const post = await postsService.findByIdOrFail(id);
        const postOutput = mapToPostOutput(post);

        res.status(HttpStatus.Ok_200).send(postOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}