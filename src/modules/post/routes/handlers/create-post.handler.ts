import { Request, Response } from "express";
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { PostInputDto } from "../../types/input/post.input-dto";
import { PostService } from "../../application/postService";
import { PostQueryRepository } from "../../repositories/post.query.repository";

export const createPostHandler = (
    postService: PostService,
    postQueryRepository: PostQueryRepository,
) => async (
    req: Request<{}, {}, PostInputDto>,
    res: Response
) => {
    try {
        const createdPostId = await postService.create(req.body);

        await postService.findByIdOrFail(createdPostId);

        const postOutput = await postQueryRepository.findById(createdPostId);

        res.status(HttpStatuses.Created_201).send(postOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}