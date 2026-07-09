import { Request, Response } from 'express';
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { BlogService } from "../../application/blog.service";
import { BlogQueryRepository } from "../../repositories/blog.query.repository";

export const getBlogHandler = (
    blogService: BlogService,
    blogQueryRepository: BlogQueryRepository
) => async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const id = req.params.id;

        await blogService.findByIdOrFail(id);

        const blogOutput = await blogQueryRepository.findById(id);

        res.status(HttpStatuses.Ok_200).send(blogOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}