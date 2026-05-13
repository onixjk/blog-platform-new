import {Request, Response} from "express";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {postsService} from "../../application/posts.service";
import {HttpStatus} from "../../../../core/types/http-statuses";
import {PostInputDto} from "../input/post.input-dto";
import {postsQueryRepository} from "../../repositories/posts.query.repository";

export async function createPostHandler(
    req: Request<{}, {}, PostInputDto>,
    res: Response
) {
    try {
        const createdPostId = await postsService.create(req.body);

        await postsService.findByIdOrFail(createdPostId);

        const postOutput = await postsQueryRepository.findById(createdPostId);

        res.status(HttpStatus.Created_201).send(postOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}