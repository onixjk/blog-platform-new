import {Request, Response} from 'express';
import {blogsService} from "../../application/blogs.service";
import {HttpStatus} from "../../../../core/types/http-statuses";
import {BlogInputDto} from "../input/blog.input-dto";
import {errorsHandler} from "../../../../core/errors/errors.handler";

export async function updateBlogHandler(
    req: Request<{ id: string }, {}, BlogInputDto>,
    res: Response
) {
    try {
        const id = req.params.id;

        await blogsService.update(id, req.body);

        res.sendStatus(HttpStatus.NoContent_204)
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}