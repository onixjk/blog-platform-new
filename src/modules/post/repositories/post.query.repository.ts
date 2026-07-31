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

        let myStatus = LikeStatus.None;

        if (userId) {
            const likeDoc = await PostLikeModel.findOne({
                postId: id.toString(),
                userId: userId.toString()
            }).lean();

            if (likeDoc) {
                myStatus = likeDoc.status as LikeStatus;
            }
        }

        const newestLikesDocs = await PostLikeModel.find({ postId: id, status: LikeStatus.Like })
            .sort({ createdAt: -1 })
            .limit(3)
            .lean();

        const formattedNewestLikes = newestLikesDocs.map(like => ({
            addedAt: like.createdAt,
            userId: like.userId,
            login: like.login
        }));

        return mapToPostOutput(post, myStatus, formattedNewestLikes);
    }

    async findMany(queryDto: PostQueryInput, userId?: string | null): Promise<PostListPaginatedOutput> {
        const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
        const skip = (pageNumber - 1) * pageSize;

        const [items, totalCount] = await Promise.all([
            PostModel.find({}).sort({ [sortBy]: sortDirection }).skip(skip).limit(pageSize).lean(),
            PostModel.countDocuments({})
        ]);

        const postIds = items.map(post => post._id.toString());

        let userLikes: any[] = [];

        if (userId) {
            userLikes = await PostLikeModel.find({ postId: { $in: postIds }, userId }).lean();
        }

        const myStatusesMap = new Map<string, LikeStatus>(userLikes.map(l => [l.postId, l.status as LikeStatus]));

        const newestLikesDocs = await PostLikeModel.aggregate([
            { $match: { postId: { $in: postIds }, status: LikeStatus.Like } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$postId",
                    latestLikes: { $push: { addedAt: "$createdAt", userId: "$userId", login: "$login" } }
                }
            },
            { $project: { latestLikes: { $slice: ["$latestLikes", 3] } } }
        ]);

        const newestLikesMap = new Map<string, any[]>(newestLikesDocs.map(d => [d._id.toString(), d.latestLikes]));

        const mappedItems = items.map(post => {
            const postIdStr = post._id.toString();
            const myStatus = myStatusesMap.get(postIdStr) ?? LikeStatus.None;
            const newestLikes = newestLikesMap.get(postIdStr) ?? [];

            return mapToPostOutput(post, myStatus, newestLikes);
        });

        return mapToPostListPaginatedOutput(mappedItems, {
            pageNumber,
            pageSize,
            totalCount
        });
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

        const [myStatusesMap, newestLikesMap] = await Promise.all([
            this._getMyStatusesMap(postIds, userId),
            this._getNewestLikesMap(postIds)
        ]);

        const itemsWithCorrectStatus = items.map((item) => {
            const postIdStr = item._id.toString();
            const myStatus = myStatusesMap.get(postIdStr) ?? LikeStatus.None;
            const newestLikes = newestLikesMap.get(postIdStr) ?? [];

            return mapToPostOutput(item, myStatus, newestLikes);
        });

        return mapToPostListPaginatedOutput(itemsWithCorrectStatus, {
            pageNumber,
            pageSize,
            totalCount,
        });
    }

    private async _getMyStatusesMap(postIds: string[], userId?: string | null): Promise<Map<string, LikeStatus>> {
        if (!userId) return new Map<string, LikeStatus>();

        const userLikes = await PostLikeModel.find({
            postId: { $in: postIds },
            userId: userId.toString()
        }).lean();

        return new Map<string, LikeStatus>(userLikes.map(l => [l.postId, l.status as LikeStatus]));
    }

    private async _getNewestLikesMap(postIds: string[]): Promise<Map<string, any[]>> {
        const newestLikesDocs = await PostLikeModel.aggregate([
            { $match: { postId: { $in: postIds }, status: LikeStatus.Like } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$postId",
                    latestLikes: { $push: { addedAt: "$createdAt", userId: "$userId", login: "$login" } }
                }
            },
            { $project: { latestLikes: { $slice: ["$latestLikes", 3] } } }
        ]);

        return new Map<string, any[]>(newestLikesDocs.map(d => [d._id.toString(), d.latestLikes]));
    }

}