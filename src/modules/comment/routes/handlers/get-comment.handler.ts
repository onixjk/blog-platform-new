import { Request, Response } from "express";
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { ResultStatus } from "../../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../../core/result/resultCodeToHttpException";
import { CommentQueryRepository } from "../../repositories/comment.query.repository";

export const getCommentHandler = (
    commentQueryRepository: CommentQueryRepository
) => async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const id = req.params.id;

        const result = await commentQueryRepository.findById(id)

        if (result.status !== ResultStatus.Success_200) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send(result.extensions);
        }

        return res
            .status(resultCodeToHttpException(result.status))
            .send(result.data);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}