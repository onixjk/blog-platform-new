import {commentCollection} from "../../../db/mongo.db";
import {ObjectId} from "mongodb";
import {mapToCommentListPaginatedOutput} from "../routers/mapers/map-to-comment-list-paginated-output.util";
import {CommentQueryInput} from "../routers/input/comment-query.input";
import {CommentListPaginatedOutput} from "../routers/output/comment-list-paginated.output";
import {CommentOutput} from "../routers/output/comment-output";
import {mapToCommentOutput} from "../routers/mapers/map-to-comment-output.util";
import {ResultStatus} from "../../../core/result/resultCode";
import {Result} from "../../../core/result/result.type";

export const commentQueryRepository = {

    async findById(id: string):
        // Promise<CommentOutput | null>
        Promise<Result<CommentOutput | null>>
    {
        const comment = await commentCollection.findOne({_id: new ObjectId(id)});

        if (!comment) {
            return {
                status: ResultStatus.NotFound,
                data: null,
                errorMessage: 'Not Found',
                extensions: [{field: null, message: 'Comment doesn\'t exist'}],
            }
        }

        // return comment ? mapToCommentOutput(comment) : null;
        return {
            status: ResultStatus.Success,
            data: mapToCommentOutput(comment),
            extensions: [],
        }
    },

    async findCommentByPost(
        queryDto: CommentQueryInput,
        postId: string,
    ): Promise<CommentListPaginatedOutput> {
        const {pageNumber, pageSize, sortBy, sortDirection} = queryDto;
        const skip = (pageNumber - 1) * pageSize;
        const filter = {'postId': postId};

        const items = await commentCollection
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(pageSize)
            .toArray();

        const totalCount = await commentCollection.countDocuments(filter)

        return mapToCommentListPaginatedOutput(items, {
            pageNumber: queryDto.pageNumber,
            pageSize: queryDto.pageSize,
            totalCount,
        });
    },
}
