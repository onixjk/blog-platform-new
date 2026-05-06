import {Request, Response} from 'express';
import {HttpStatus} from "../../../../core/types/http-statuses";
import {blogsService} from "../../application/blogs.service";
import {BlogInputDto} from "../input/blog.input-dto";
import {mapToBlogOutput} from "../mapers/map-to-blog-output.util";
import {errorsHandler} from "../../../../core/errors/errors.handler";

export async function createBlogHandler(
    req: Request<{}, {}, BlogInputDto>,
    res: Response
) {
    try {
        const createdBlogId = await blogsService.create(req.body);

        const createdBlog = await blogsService.findByIdOrFail(createdBlogId);
        const blogOutput = mapToBlogOutput(createdBlog);

        res.status(HttpStatus.Created_201).send(blogOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}