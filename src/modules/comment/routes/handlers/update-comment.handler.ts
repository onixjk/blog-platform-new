import { Request, Response } from "express";
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { CommentInputDto } from "../../types/input/comment-input.dto";
import { ResultStatus } from "../../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../../core/result/resultCodeToHttpException";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { commentService } from "../../../../composition-root";

export async function updateCommentHandler(
    req: Request<{ id: string }, {}, CommentInputDto>,
    res: Response
) {
    try {
        const commentId = req.params.id;
        const userId = req.user.id!;

        const commentData = { commentId, userId, ...req.body }

        const result = await commentService.update(commentData);

        if (result.status !== ResultStatus.NoContent_204) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send(result.extensions);
        }

        return res.sendStatus(HttpStatuses.NoContent_204)
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}