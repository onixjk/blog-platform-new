import { Request, Response } from 'express';
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { PostInputDto } from "../../types/input/post.input-dto";
import { postsService } from "../../../../composition-root";

export async function updatePostHandler(
    req: Request<{ id: string }, {}, PostInputDto>,
    res: Response
) {
    try {
        const id = req.params.id;

        await postsService.update(id, req.body);

        res.sendStatus(HttpStatuses.NoContent_204)
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}