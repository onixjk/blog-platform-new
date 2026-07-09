import { Request, Response } from 'express';
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { BlogInputDto } from "../../types/input/blog.input-dto";
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { BlogService } from "../../application/blog.service";
import { BlogQueryRepository } from "../../repositories/blog.query.repository";

export const createBlogHandler = (
    blogService: BlogService,
    blogQueryRepository: BlogQueryRepository
) => async (
    req: Request<{}, {}, BlogInputDto>,
    res: Response
) => {
    try {
        const createdBlogId = await blogService.create(req.body);

        await blogService.findByIdOrFail(createdBlogId);

        const blogOutput = await blogQueryRepository.findById(createdBlogId);

        res.status(HttpStatuses.Created_201).send(blogOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}