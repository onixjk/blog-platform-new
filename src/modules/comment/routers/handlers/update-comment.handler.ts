import {Request, Response} from "express";
import {HttpStatuses} from "../../../../core/types/http-statuses";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {CommentInputDto} from "../input/comment.input-dto";
import {commentService} from "../../application/comment.service";

export async function updateCommentHandler(
    req: Request<{ id: string }, {}, CommentInputDto>,
    res: Response
) {
    try {
        const commentId = req.params.id;
        const userId = req.user!.id;

        await commentService.update(commentId, userId, req.body);

        res.sendStatus(HttpStatuses.NoContent_204)
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}