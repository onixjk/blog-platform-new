import {Request, Response} from 'express';
import {HttpStatus} from "../../../../core/types/http-statuses";
import {postsService} from "../../application/posts.service";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {PostInputDto} from "../input/post.input-dto";


export async function updatePostHandler(
    req: Request<{ id: string }, {}, PostInputDto>,
    res: Response
) {
    try {
        const id = req.params.id;

        await postsService.update(id, req.body);

        res.sendStatus(HttpStatus.NoContent_204)
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}