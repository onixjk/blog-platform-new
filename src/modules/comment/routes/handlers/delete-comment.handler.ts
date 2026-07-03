import { Request, Response } from "express";
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { ResultStatus } from "../../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../../core/result/resultCodeToHttpException";
import { commentService } from "../../../../composition-root";

export async function deleteCommentHandler(
    req: Request<{ id: string }>,
    res: Response
) {
    try {
        const commentId = req.params.id;
        const userId = req.user.id!;

        const result = await commentService.delete(commentId, userId);

        if (result.status !== ResultStatus.NoContent_204) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send(result.extensions);
        }

        return res.sendStatus(resultCodeToHttpException(result.status))

    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}