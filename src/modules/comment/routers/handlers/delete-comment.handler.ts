import {Request, Response} from "express";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {commentService} from "../../application/comment.service";
import {ResultStatus} from "../../../../core/result/resultCode";
import {resultCodeToHttpException} from "../../../../core/result/resultCodeToHttpException";

export async function deleteCommentHandler(
    req: Request<{ id: string }>,
    res: Response
) {
    try {
        const commentId = req.params.id;
        const userId = req.user!.id;

        const result = await commentService.delete(commentId, userId);

        if (result.status !== ResultStatus.NoContent) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send(result.extensions);
        }

        // res.sendStatus(HttpStatuses.NoContent_204);
        return res.sendStatus(resultCodeToHttpException(result.status))

    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}