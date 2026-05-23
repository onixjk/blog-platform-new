import {Request, Response} from "express";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {CommentInputDto} from "../../../comment/routers/input/comment-input.dto";
import {commentService} from "../../../comment/application/comment.service";
import {commentQueryRepository} from "../../../comment/repositories/comment.query.repository";
import {ResultStatus} from "../../../../core/result/resultCode";
import {resultCodeToHttpException} from "../../../../core/result/resultCodeToHttpException";

export async function createPostCommentHandler(
    req: Request<{ postId: string }, {}, CommentInputDto>,
    res: Response
) {
    try {
        const {postId} = req.params;
        const userId = req.user!.id;

        const commentData = {...req.body, userId, postId};
        const result = await commentService.create(commentData);

        if (result.status !== ResultStatus.Created) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send(result.extensions);
        }

        const commentOutput = await commentQueryRepository.findById(result!.data);
        // res.status(HttpStatuses.Created_201).send(commentOutput);
        return res
            .status(resultCodeToHttpException(result.status))
            .send(commentOutput.data);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}