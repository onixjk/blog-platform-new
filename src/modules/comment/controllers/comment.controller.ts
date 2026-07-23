import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import { ResultStatus } from "../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../core/result/resultCodeToHttpException";
import { CommentService } from "../application/comment.service";
import { CommentQueryRepository } from "../repositories/comment.query.repository";
import { CommentInputDto } from "../types/input/comment-input.dto";
import { HttpStatuses } from "../../../core/types/http-statuses";
import { LikeStatus } from "../../like/types/like-status";

@injectable()
export class CommentController {

    constructor(
        @inject(CommentQueryRepository) private commentQueryRepository: CommentQueryRepository,
        @inject(CommentService) private commentService: CommentService,
    ) {}

    async getComment(req: Request<{ commentId: string }>, res: Response) {

        const id = req.params.commentId;
        if (!id) return res.sendStatus(HttpStatuses.NotFound_404);

        const userId = req.user?.id;

        const commentOutput = await this.commentQueryRepository.findById(id, userId);
        if (!commentOutput) return res.sendStatus(HttpStatuses.NotFound_404);

        res.status(HttpStatuses.Ok_200).send(commentOutput);
    }

    async updateComment(req: Request<{ commentId: string }, {}, CommentInputDto>, res: Response) {

        const commentId = req.params.commentId;
        if (!commentId) return res.sendStatus(HttpStatuses.NotFound_404);

        const userId = req.user.id!;

        const commentData = { commentId, userId, ...req.body }

        const result = await this.commentService.update(commentData);

        if (result.status !== ResultStatus.Success) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send({ errorsMessages: result.extensions });
        }

        return res.sendStatus(HttpStatuses.NoContent_204)
    }

    async updateLikeStatus(req: Request<{ commentId: string }, {}, { likeStatus: LikeStatus }>, res: Response) {

        const commentId = req.params.commentId;
        if (!commentId) return res.sendStatus(HttpStatuses.NotFound_404);

        const userId = req.user.id!;

        const likeStatus = req.body.likeStatus;
        if (!likeStatus) return res.sendStatus(HttpStatuses.BadRequest_400);

        const commentData = { commentId, userId, likeStatus }

        const result = await this.commentService.updateLikeCountAndStatus(commentData);

        if (result.status !== ResultStatus.Success) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send({ errorsMessages: result.extensions });
        }

        return res.sendStatus(HttpStatuses.NoContent_204)
    }

    async deleteComment(req: Request<{ commentId: string }>, res: Response) {

        const commentId = req.params.commentId;
        if (!commentId) return res.sendStatus(HttpStatuses.NotFound_404);

        const userId = req.user.id!;

        const result = await this.commentService.delete(commentId, userId);

        if (result.status !== ResultStatus.Success) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send({ errorsMessages: result.extensions });
        }

        res.sendStatus(HttpStatuses.NoContent_204);
    }
}