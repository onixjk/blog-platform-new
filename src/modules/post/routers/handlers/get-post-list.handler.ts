import {Request, Response} from 'express';
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {PostQueryInput} from "../input/post-query.input";
import {matchedData} from "express-validator";
import {setDefaultSortAndPaginationIfNotExist} from "../../../../core/helpers/set-default-sort-and-pagination";
import {postsService} from "../../application/posts.service";
import {mapToPostListPaginatedOutput} from "../mapers/map-to-post-list-paginated-output.util";

export async function getPostListHandler(
    req: Request<{}, {}, {}, PostQueryInput>,
    res: Response,
) {
    try {
        const sanitizedQuery = matchedData<PostQueryInput>(req, {
            locations: ['query'],
            includeOptionals: true,
        });

        const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

        const {items, totalCount} = await postsService.findMany(queryInput);

        const postsListOutput = mapToPostListPaginatedOutput(items, {
            pageNumber: queryInput.pageNumber,
            pageSize: queryInput.pageSize,
            totalCount,
        });

        res.send(postsListOutput)
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}