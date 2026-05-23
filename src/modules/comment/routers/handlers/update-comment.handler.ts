import {Request, Response} from "express";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {commentService} from "../../application/comment.service";
import {CommentInputDto} from "../input/comment-input.dto";
import {ResultStatus} from "../../../../core/result/resultCode";
import {resultCodeToHttpException} from "../../../../core/result/resultCodeToHttpException";

export async function updateCommentHandler(
    req: Request<{ id: string }, {}, CommentInputDto>,
    res: Response
) {
    try {
        const commentId = req.params.id;
        const userId = req.user!.id;

        const commentData = {commentId, userId, ...req.body}

        const result = await commentService.update(commentData);

        if (result.status !== ResultStatus.NoContent) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send(result.extensions);
        }

        return res.sendStatus(resultCodeToHttpException(result.status))
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}