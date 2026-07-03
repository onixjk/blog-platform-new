import {commentCollection} from "../../../db/mongo.db";
import {ObjectId} from "mongodb";
import {mapToCommentListPaginatedOutput} from "../routes/mapers/map-to-comment-list-paginated-output.util";
import {CommentQueryInput} from "../routes/input/comment-query.input";
import {CommentListPaginatedOutput} from "../routes/output/comment-list-paginated.output";
import {CommentOutput} from "../routes/output/comment-output";
import {mapToCommentOutput} from "../routes/mapers/map-to-comment-output.util";
import {ResultStatus} from "../../../core/result/resultCode";
import {Result} from "../../../core/result/result.type";

export class CommentQueryRepository {

    async findById(id: string): Promise<Result<CommentOutput | null>>
    {
        const comment = await commentCollection.findOne({_id: new ObjectId(id)});

        if (!comment) {
            return {
                status: ResultStatus.NotFound_404,
                data: null,
                errorMessage: 'Not Found',
                extensions: [{field: null, message: 'Comment doesn\'t exist'}],
            }
        }

        return {
            status: ResultStatus.Success_200,
            data: mapToCommentOutput(comment),
            extensions: [],
        }
    }

    async findCommentByPost(
        queryDto: CommentQueryInput,
        postId: string,
    ): Promise<Result<CommentListPaginatedOutput>> {
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
        const paginatedData = mapToCommentListPaginatedOutput(items, {
            pageNumber: queryDto.pageNumber,
            pageSize: queryDto.pageSize,
            totalCount,
        });

        return {
            status: ResultStatus.Success_200,
            data: paginatedData,
            extensions: []
        };
    }
}