import { Request, Response } from "express";
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { PostInputDto } from "../../types/input/post.input-dto";
import { postsQueryRepository, postsService } from "../../../../composition-root";

export async function createPostHandler(
    req: Request<{}, {}, PostInputDto>,
    res: Response
) {
    try {
        const createdPostId = await postsService.create(req.body);

        await postsService.findByIdOrFail(createdPostId);

        const postOutput = await postsQueryRepository.findById(createdPostId);

        res.status(HttpStatuses.Created_201).send(postOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}