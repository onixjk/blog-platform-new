import {Request, Response} from "express";
import {HttpStatuses} from "../../../../core/types/http-statuses";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {commentService} from "../../application/comment.service";
import {commentQueryRepository} from "../../repositories/comment.query.repository";

export async function getCommentHandler(
    req: Request<{ id: string }>,
    res: Response
) {
    try {
        const id = req.params.id;

        await commentService.findByIdOrFail(id);

        const commentOutput = await commentQueryRepository.findById(id)

        res.status(HttpStatuses.Ok_200).send(commentOutput.data);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}