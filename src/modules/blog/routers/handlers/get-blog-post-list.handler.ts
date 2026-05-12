import {Request, Response} from 'express';
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {postsService} from "../../../post/application/posts.service";
import {PostQueryInput} from "../../../post/routers/input/post-query.input";
import {mapToPostListPaginatedOutput} from "../../../post/routers/mapers/map-to-post-list-paginated-output.util";
import {HttpStatus} from "../../../../core/types/http-statuses";
import {matchedData} from "express-validator";
import {setDefaultSortAndPaginationIfNotExist} from "../../../../core/helpers/set-default-sort-and-pagination";
import {blogsService} from "../../application/blogs.service";

export async function getBlogPostListHandler(
    req: Request<{ blogId: string }, {}, {}, {}>,
    res: Response
) {
    try {
        const blogId = req.params.blogId;
        await blogsService.findByIdOrFail(blogId);

        // const query = req.query as PostQueryInput;
        //
        // const queryInput = {
        //     ...query,
        //     pageNumber: Number(query.pageNumber) || 1,
        //     pageSize: Number(query.pageSize) || 10,
        //     sortBy: query.sortBy || 'createdAt',
        //     sortDirection: query.sortDirection || 'desc'
        // };

        const sanitizedQuery = matchedData<PostQueryInput>(req, {
            locations: ['query'],
            includeOptionals: true,
        });

        const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

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