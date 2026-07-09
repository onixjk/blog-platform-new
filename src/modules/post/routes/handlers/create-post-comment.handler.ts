import { Request, Response } from "express";
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { CommentInputDto } from "../../../comment/types/input/comment-input.dto";
import { ResultStatus } from "../../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../../core/result/resultCodeToHttpException";
import { CommentService } from "../../../comment/application/comment.service";
import { CommentQueryRepository } from "../../../comment/repositories/comment.query.repository";

export const createPostCommentHandler = (
    commentService: CommentService,
    commentQueryRepository: CommentQueryRepository,
) => async (
    req: Request<{ postId: string }, {}, CommentInputDto>,
    res: Response
) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id!;

        const commentData = { ...req.body, userId, postId };
        const result = await commentService.create(commentData);

        if (result.status !== ResultStatus.Created_201) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send(result.extensions);
        }

        const commentOutput = await commentQueryRepository.findById(result.data!);

        return res
            .status(resultCodeToHttpException(result.status))
            .send(commentOutput.data);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}