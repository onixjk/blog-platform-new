import {Request, Response} from "express";
import {HttpStatuses} from "../../../../core/types/http-statuses";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {CommentInputDto} from "../../../comment/routers/input/comment-input.dto";
import {commentService} from "../../../comment/application/comment.service";
import {commentQueryRepository} from "../../../comment/repositories/comment.query.repository";

export async function createPostCommentHandler(
    req: Request<{postId: string}, {}, CommentInputDto>,
    res: Response
) {
    try {
        const { postId } = req.params;
        const userId = req.user!.id;

        const commentData = { ...req.body, userId, postId};
        const createdCommentId = await commentService.create(commentData);

        const commentOutput = await commentQueryRepository.findById(createdCommentId);

        res.status(HttpStatuses.Created_201).send(commentOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}