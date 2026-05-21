import {Request, Response} from "express";
import {matchedData} from "express-validator";
import {setDefaultSortAndPaginationIfNotExist} from "../../../../core/helpers/set-default-sort-and-pagination";
import {HttpStatuses} from "../../../../core/types/http-statuses";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {CommentQueryInput} from "../../../comment/routers/input/comment-query.input";
import {postsService} from "../../application/posts.service";
import {commentQueryRepository} from "../../../comment/repositories/comment.query.repository";

export async function getPostCommentListHandler(
    req: Request<{ postId: string }, {}, {}, {}>,
    res: Response
) {
    try {
        const postId = req.params.postId;
        await postsService.findByIdOrFail(postId);

        const sanitizedQuery = matchedData<CommentQueryInput>(req, {
            locations: ['query'],
            includeOptionals: true,
        });

        const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

        const commentsListOutput = await commentQueryRepository.findCommentByPost(
            queryInput,
            postId,
        );

        res.status(HttpStatuses.Ok_200).send(commentsListOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}