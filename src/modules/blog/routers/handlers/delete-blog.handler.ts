import {Request, Response} from 'express';
import {HttpStatus} from "../../../../core/types/http-statuses";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {blogsService} from "../../application/blogs.service";

export async function deleteBlogHandler(
    req: Request<{ id: string }>,
    res: Response
) {
    try {
        const id = req.params.id;

        await blogsService.delete(id);

        res.sendStatus(HttpStatus.NoContent_204);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}