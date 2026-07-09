import { Request, Response } from 'express';
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { PostService } from "../../application/postService";
import { PostQueryRepository } from "../../repositories/post.query.repository";

export const getPostHandler = (
    postService: PostService,
    postQueryRepository: PostQueryRepository,
) => async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const id = req.params.id;

        await postService.findByIdOrFail(id);

        const postOutput = await postQueryRepository.findById(id)

        res.status(HttpStatuses.Ok_200).send(postOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}