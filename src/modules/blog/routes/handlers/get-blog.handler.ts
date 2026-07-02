import { Request, Response } from 'express';
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { blogsQueryRepository, blogsService } from "../../../../composition-root";

export async function getBlogHandler(
    req: Request<{ id: string }>,
    res: Response
) {
    try {
        const id = req.params.id;

        await blogsService.findByIdOrFail(id);

        const blogOutput = await blogsQueryRepository.findById(id);

        res.status(HttpStatuses.Ok_200).send(blogOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}