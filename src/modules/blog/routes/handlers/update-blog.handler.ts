import { Request, Response } from 'express';
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { BlogInputDto } from "../../types/input/blog.input-dto";
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { BlogService } from "../../application/blog.service";

export const updateBlogHandler = (
    blogService: BlogService
) => async (
    req: Request<{ id: string }, {}, BlogInputDto>,
    res: Response
) => {
    try {
        const id = req.params.id;

        await blogService.update(id, req.body);

        res.sendStatus(HttpStatuses.NoContent_204)
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}