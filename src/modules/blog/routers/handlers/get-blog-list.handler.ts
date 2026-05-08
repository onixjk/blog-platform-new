import {Request, Response} from 'express';
import {BlogQueryInput} from "../input/blog-query.input";
import {matchedData} from "express-validator";
import {setDefaultSortAndPaginationIfNotExist} from "../../../../core/helpers/set-default-sort-and-pagination";
import {blogsService} from "../../application/blogs.service";
import {mapToBlogListPaginatedOutput} from "../mapers/map-to-blog-list-paginated-output.util";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {HttpStatus} from "../../../../core/types/http-statuses";

export async function getBlogListHandler(
    req: Request,
    res: Response
) {
    try {
        const sanitizedQuery = matchedData<BlogQueryInput>(req, {
            locations: ['query'],
            includeOptionals: true,
        });

        const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

        const { items, totalCount } = await blogsService.findMany(queryInput);

        const blogsListOutput = mapToBlogListPaginatedOutput(items, {
            pageNumber: queryInput.pageNumber,
            pageSize: queryInput.pageSize,
            totalCount,
        });

        res.status(HttpStatus.Ok_200).send(blogsListOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}