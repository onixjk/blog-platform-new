import {Request, Response} from 'express';
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {postsService} from "../../../post/application/posts.service";
import {PostQueryInput} from "../../../post/routers/input/post-query.input";
import {mapToPostListPaginatedOutput} from "../../../post/routers/mapers/map-to-post-list-paginated-output.util";
import {HttpStatus} from "../../../../core/types/http-statuses";

export async function getBlogPostListHandler(
    req: Request<{ blogId: string }, {}, {}, PostQueryInput>,
    res: Response
) {
    try {
        const blogId = req.params.blogId;

        const queryInput = {
            ...req.query,
            pageNumber: Number(req.query.pageNumber) || 1,
            pageSize: Number(req.query.pageSize) || 10,
            sortBy: req.query.sortBy || 'createdAt',
            sortDirection: req.query.sortDirection || 'desc'
        };

        const {items, totalCount} = await postsService.findPostsByBlog(
            queryInput,
            blogId,
        );

        const postListOutput = mapToPostListPaginatedOutput(items, {
            pageNumber: queryInput.pageNumber,
            pageSize:queryInput.pageSize,
            totalCount,
        });

        res.status(HttpStatus.Ok_200).send(postListOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}