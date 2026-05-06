import {Request, Response} from 'express';
import {HttpStatus} from "../../../../core/types/http-statuses";
import {mapToBlogOutput} from "../mapers/map-to-blog-output.util";
import {blogsService} from "../../application/blogs.service";
import {errorsHandler} from "../../../../core/errors/errors.handler";

export async function getBlogHandler(
    req: Request<{ id: string }>,
    res: Response
) {
    try {
        const id = req.params.id;
        const blog = await blogsService.findByIdOrFail(id);
        const blogOutput = mapToBlogOutput(blog);

        res.status(HttpStatus.Ok_200).send(blogOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}