import { Request, Response } from 'express';
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { BlogService } from "../../application/blog.service";

export const deleteBlogHandler = (
    blogService: BlogService
) => async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const id = req.params.id;

        await blogService.delete(id);

        res.sendStatus(HttpStatuses.NoContent_204);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}