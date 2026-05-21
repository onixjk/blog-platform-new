import {commentCollection} from "../../../db/mongo.db";
import {ObjectId} from "mongodb";
import {mapToCommentListPaginatedOutput} from "../routers/mapers/map-to-comment-list-paginated-output.util";
import {CommentQueryInput} from "../routers/input/comment-query.input";
import {CommentListPaginatedOutput} from "../routers/output/comment-list-paginated.output";
import {CommentOutput} from "../routers/output/comment-output";
import {mapToCommentOutput} from "../routers/mapers/map-to-comment-output.util";

export const commentsQueryRepository = {

    // async findMany(
    //     queryDto: CommentQueryInput
    // ): Promise<CommentListPaginatedOutput> {
    //     const {pageNumber, pageSize, sortBy, sortDirection} = queryDto;
    //     const skip = (pageNumber - 1) * pageSize;
    //     const filter: any = {};
    //
    //     const items = await commentCollection
    //         .find(filter)
    //         .sort({[sortBy]: sortDirection})
    //         .skip(skip)
    //         .limit(pageSize)
    //         .toArray();
    //
    //     const totalCount = await commentCollection.countDocuments(filter);
    //
    //     return mapToCommentListPaginatedOutput(items, {
    //         pageNumber: queryDto.pageNumber,
    //         pageSize: queryDto.pageSize,
    //         totalCount,
    //     });
    // },

    async findById(id: string): Promise<CommentOutput | null> {
        const comment = await commentCollection.findOne({_id: new ObjectId(id)});

        return comment ? mapToCommentOutput(comment) : null;
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
