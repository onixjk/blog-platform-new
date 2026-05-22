import {Request, Response} from "express";
import {HttpStatuses} from "../../../../core/types/http-statuses";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {commentService} from "../../application/comment.service";
import {CommentInputDto} from "../input/comment-input.dto";

export async function updateCommentHandler(
    req: Request<{ id: string }, {}, CommentInputDto>,
    res: Response
) {
    try {
        const commentId = req.params.id;
        const userId = req.user!.id;

        const commentData = {commentId, userId, ...req.body}

        await commentService.update(commentData);

        res.sendStatus(HttpStatuses.NoContent_204)
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}