import {Request, Response} from 'express';
import {HttpStatus} from "../../../../core/types/http-statuses";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {blogsQueryRepository} from "../../repositories/blogs.query.repository";
import {blogsService} from "../../application/blogs.service";

export async function getBlogHandler(
    req: Request<{ id: string }>,
    res: Response
) {
    try {
        const id = req.params.id;

        await blogsService.findByIdOrFail(id);

        const blogOutput = blogsQueryRepository.findById(id);

        res.status(HttpStatus.Ok_200).send(blogOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}