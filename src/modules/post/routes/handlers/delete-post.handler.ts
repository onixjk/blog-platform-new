import { Request, Response } from 'express';
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import PostService from "../../application/postService";

export const deletePostHandler = (
    postService: PostService
) => async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const id = req.params.id;

        await postService.delete(id);

        res.sendStatus(HttpStatuses.NoContent_204);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}