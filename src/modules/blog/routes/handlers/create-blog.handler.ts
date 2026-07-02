import {Request, Response} from 'express';
import {HttpStatuses} from "../../../../core/types/http-statuses";
import {BlogInputDto} from "../input/blog.input-dto";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import { blogsQueryRepository, blogsService } from "../../../../composition-root";

export async function createBlogHandler(
    req: Request<{}, {}, BlogInputDto>,
    res: Response
) {
    try {
        const createdBlogId = await blogsService.create(req.body);

        await blogsService.findByIdOrFail(createdBlogId);

        const blogOutput = await blogsQueryRepository.findById(createdBlogId);

        res.status(HttpStatuses.Created_201).send(blogOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}