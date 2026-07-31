import { PostQueryInput } from "../types/input/post-query.input";
import { PostListPaginatedOutput } from "../types/output/post-list-paginated.output";
import { mapToPostListPaginatedOutput } from "../routes/mapers/map-to-post-list-paginated-output.util";
import { PostOutput } from "../types/output/post-output";
import { mapToPostOutput } from "../routes/mapers/map-to-post-output.util";
import { injectable } from "inversify";
import { PostLikeModel, PostModel } from "../../../db/mongo.db";
import { LikeStatus } from "../../like/types/like-status";

@injectable()
export class PostQueryRepository {

    async findById(id: string, userId?: string | null): Promise<PostOutput | null> {
        const post = await PostModel.findById(id).lean();
        if (!post) return null;

        const myStatus = userId ? await this._getMyStatus(id, userId) : LikeStatus.None;

        const newestLikes = post.extendedLikesInfo?.newestLikes ?? [];

        return mapToPostOutput(post, myStatus, newestLikes);
    }

    async findMany(queryDto: PostQueryInput, userId?: string | null): Promise<PostListPaginatedOutput> {
        const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
        const skip = (pageNumber - 1) * pageSize;

        const [items, totalCount] = await Promise.all([
            PostModel.find({}).sort({ [sortBy]: sortDirection }).skip(skip).limit(pageSize).lean(),
            PostModel.countDocuments({})
        ]);

        const postIds = items.map(post => post._id.toString());

        const myStatusesMap = await this._getMyStatusesMap(postIds, userId);

        const mappedItems = items.map(post => {
            const postIdStr = post._id.toString();
            const myStatus = myStatusesMap.get(postIdStr) ?? LikeStatus.None;
            const newestLikes = post.extendedLikesInfo?.newestLikes ?? [];

            return mapToPostOutput(post, myStatus, newestLikes);
        });

        return mapToPostListPaginatedOutput(mappedItems, { pageNumber, pageSize, totalCount });
    }

    async findPostsByBlog(queryDto: PostQueryInput, blogId: string, userId?: string | null): Promise<PostListPaginatedOutput> {
        const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
        const skip = (pageNumber - 1) * pageSize;
        const filter = { 'blogId': blogId };

        const [items, totalCount] = await Promise.all([
            PostModel
                .find(filter)
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(pageSize)
                .lean(),
            PostModel
                .countDocuments(filter)
        ]);

        const postIds = items.map(item => item._id.toString());

        const myStatusesMap = await this._getMyStatusesMap(postIds, userId);

        const itemsWithCorrectStatus = items.map(item => {
            const postIdStr = item._id.toString();
            const myStatus = myStatusesMap.get(postIdStr) ?? LikeStatus.None;
            const newestLikes = item.extendedLikesInfo?.newestLikes ?? [];

            return mapToPostOutput(item, myStatus, newestLikes);
        });

        return mapToPostListPaginatedOutput(itemsWithCorrectStatus, { pageNumber, pageSize, totalCount, });
    }

    private async _getMyStatusesMap(postIds: string[], userId?: string | null): Promise<Map<string, LikeStatus>> {
        if (!userId) return new Map<string, LikeStatus>();

        const userLikes = await PostLikeModel.find({
            postId: { $in: postIds },
            userId: userId.toString()
        })
            .lean();

        return new Map<string, LikeStatus>(userLikes.map(l => [l.postId, l.status as LikeStatus]));
    }

    private async _getMyStatus(postId: string, userId: string): Promise<LikeStatus> {
        const likeDoc = await PostLikeModel.findOne({
            postId: postId.toString(),
            userId: userId.toString()
        })
            .lean();

        return likeDoc ? (likeDoc.status as LikeStatus) : LikeStatus.None;
    }

}