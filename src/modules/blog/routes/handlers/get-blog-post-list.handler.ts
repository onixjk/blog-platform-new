import { Request, Response } from 'express';
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { PostQueryInput } from "../../../post/routes/input/post-query.input";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { matchedData } from "express-validator";
import { setDefaultSortAndPaginationIfNotExist } from "../../../../core/helpers/set-default-sort-and-pagination";
import { blogsService, postsQueryRepository } from "../../../../composition-root";

export async function getBlogPostListHandler(
    req: Request<{ blogId: string }, {}, {}, {}>,
    res: Response
) {
    try {
        const blogId = req.params.blogId;
        await blogsService.findByIdOrFail(blogId);

        const sanitizedQuery = matchedData<PostQueryInput>(req, {
            locations: ['query'],
            includeOptionals: true,
        });

        const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

        const postListOutput = await postsQueryRepository.findPostsByBlog(
            queryInput,
            blogId,
        );

        res.status(HttpStatuses.Ok_200).send(postListOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}