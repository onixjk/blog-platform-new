import { mapToCommentListPaginatedOutput } from "../routes/mapers/map-to-comment-list-paginated-output.util";
import { CommentQueryInput } from "../types/input/comment-query.input";
import { CommentListPaginatedOutput } from "../types/output/comment-list-paginated.output";
import { CommentOutput } from "../types/output/comment-output";
import { mapToCommentOutput } from "../routes/mapers/map-to-comment-output.util";
import { injectable } from "inversify";
import { CommentModel } from "../../../db/mongo.db";

@injectable()
export class CommentQueryRepository {

    async findById(id: string): Promise<CommentOutput | null> {

        const comment = await CommentModel.findById(id).lean();

        return comment ? mapToCommentOutput(comment) : null;
    }

    async findCommentByPost(
        queryDto: CommentQueryInput,
        postId: string,
    ): Promise<CommentListPaginatedOutput> {
        const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
        const skip = (pageNumber - 1) * pageSize;
        const filter = { 'postId': postId };

        const [items, totalCount] = await Promise.all([
            CommentModel
                .find(filter)
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(pageSize)
                .lean(),
            CommentModel
                .countDocuments(filter)
        ]);

        return mapToCommentListPaginatedOutput(items, {
            pageNumber,
            pageSize,
            totalCount,
        });
    }
}