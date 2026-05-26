import {Request, Response} from 'express';
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {HttpStatuses} from "../../../../core/types/http-statuses";
import {postsQueryRepository} from "../../repositories/posts.query.repository";
import {postsService} from "../../application/posts.service";

export async function getPostHandler(
    req: Request<{ id: string }>,
    res: Response
) {
    try {
        const id = req.params.id;

        await postsService.findByIdOrFail(id);

        const postOutput = await postsQueryRepository.findById(id)

        res.status(HttpStatuses.Ok_200).send(postOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}