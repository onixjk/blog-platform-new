import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { setDefaultSortAndPaginationIfNotExist } from "../../../../core/helpers/set-default-sort-and-pagination";
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { CommentQueryInput } from "../../../comment/routes/input/comment-query.input";
import { ResultStatus } from "../../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../../core/result/resultCodeToHttpException";
import { commentQueryRepository, postsService } from "../../../../composition-root";

export async function getPostCommentListHandler(
    req: Request<{ postId: string }, {}, {}, {}>,
    res: Response
) {
    try {
        const postId = req.params.postId;
        const postResult = await postsService.findById(postId);

        if (postResult.status !== ResultStatus.Success_200) {
            return res
                .status(resultCodeToHttpException(postResult.status))
                .send(postResult.extensions);
        }

        const sanitizedQuery = matchedData<CommentQueryInput>(req, {
            locations: ['query'],
            includeOptionals: true,
        });

        const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

        const result = await commentQueryRepository.findCommentByPost(
            queryInput,
            postId,
        );

        if (result.status !== ResultStatus.Success_200) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send(result.extensions);
        }

        return res
            .status(resultCodeToHttpException(result.status))
            .send(result.data);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}