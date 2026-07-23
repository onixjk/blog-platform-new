import { mapToCommentListPaginatedOutput } from "../routes/mapers/map-to-comment-list-paginated-output.util";
import { CommentQueryInput } from "../types/input/comment-query.input";
import { CommentListPaginatedOutput } from "../types/output/comment-list-paginated.output";
import { CommentOutput } from "../types/output/comment-output";
import { mapToCommentOutput } from "../routes/mapers/map-to-comment-output.util";
import { injectable } from "inversify";
import { CommentModel, LikeModel } from "../../../db/mongo.db";
import { LikeStatus } from "../../like/types/like-status";

@injectable()
export class CommentQueryRepository {

    async findById(id: string, userId?: string | null): Promise<CommentOutput | null> {

        const comment = await CommentModel.findById(id).lean();

        let myStatus = LikeStatus.None;

        if (userId) {
            const likeDoc = await LikeModel.findOne({
                commentId: id.toString(),
                userId: userId.toString()
            }).lean();

            if (likeDoc) {
                myStatus = likeDoc.status as LikeStatus;
            }
        }

        return comment ? mapToCommentOutput(comment, myStatus) : null;
    }

    async findCommentByPost(
        queryDto: CommentQueryInput,
        postId: string,
        userId?: string | null,
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

        const commentIds = items.map(item => item._id.toString());

        let userLikes: any[] = [];

        if (userId) {
            userLikes = await LikeModel.find({
                commentId: { $in: commentIds },
                userId: userId.toString()
            }).lean();
        }

        const likesMap = new Map(userLikes.map(like => [like.commentId, like.status]));

        const itemsWithCorrectStatus = items.map((item) => {
            const myStatus = (likesMap.get(item._id.toString()) as LikeStatus) ?? LikeStatus.None;
            return mapToCommentOutput(item, myStatus);
        });

        return mapToCommentListPaginatedOutput(itemsWithCorrectStatus, {
            pageNumber,
            pageSize,
            totalCount,
        });
    }
}