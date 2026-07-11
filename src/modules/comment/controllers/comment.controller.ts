import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import { ResultStatus } from "../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../core/result/resultCodeToHttpException";
import { errorsHandler } from "../../../core/errors/errors.handler";
import { CommentService } from "../application/comment.service";
import { CommentQueryRepository } from "../repositories/comment.query.repository";
import { CommentInputDto } from "../types/input/comment-input.dto";
import { HttpStatuses } from "../../../core/types/http-statuses";

@injectable()
export class CommentController {

    constructor(
        @inject(CommentQueryRepository) private commentQueryRepository: CommentQueryRepository,
        @inject(CommentService) private commentService: CommentService,
    ) {}

    async getComment(req: Request<{ id: string }>, res: Response) {
        try {
            const id = req.params.id;

            const result = await this.commentQueryRepository.findById(id)

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

    async updateComment(req: Request<{ id: string }, {}, CommentInputDto>, res: Response) {
        try {
            const commentId = req.params.id;
            const userId = req.user.id!;

            const commentData = { commentId, userId, ...req.body }

            const result = await this.commentService.update(commentData);

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

    async deleteComment(req: Request<{ id: string }>, res: Response) {
        try {
            const commentId = req.params.id;
            const userId = req.user.id!;

            const result = await this.commentService.delete(commentId, userId);

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
}