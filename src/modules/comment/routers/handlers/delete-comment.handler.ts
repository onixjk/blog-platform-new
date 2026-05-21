import {Request, Response} from "express";
import {HttpStatuses} from "../../../../core/types/http-statuses";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {commentService} from "../../application/comment.service";

export async function deleteCommentHandler(
    req: Request<{ id: string }>,
    res: Response
) {
    try {
        const id = req.params.id;

        await commentService.delete(id);

        res.sendStatus(HttpStatuses.NoContent_204);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}