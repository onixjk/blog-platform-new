import { PostQueryInput } from "../types/input/post-query.input";
import { PostListPaginatedOutput } from "../types/output/post-list-paginated.output";
import { mapToPostListPaginatedOutput } from "../routes/mapers/map-to-post-list-paginated-output.util";
import { PostOutput } from "../types/output/post-output";
import { mapToPostOutput } from "../routes/mapers/map-to-post-output.util";
import { injectable } from "inversify";
import { LikeCommentsModel, LikePostsModel, PostModel } from "../../../db/mongo.db";
import { LikeStatus } from "../../like/types/like-status";

@injectable()
export class PostQueryRepository {

    async findById(id: string, userId?: string | null): Promise<PostOutput | null> {
        const post = await PostModel.findById(id).lean();

        let myStatus = LikeStatus.None;

        if (userId) {
            const likeDoc = await LikeCommentsModel.findOne({
                commentId: id.toString(),
                userId: userId.toString()
            }).lean();

            if (likeDoc) {
                myStatus = likeDoc.status as LikeStatus;
            }
        }

        return post ? mapToPostOutput(post, myStatus) : null;
    }

    // async findMany(queryDto: PostQueryInput): Promise<PostListPaginatedOutput> {
    //     const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
    //     const skip = (pageNumber - 1) * pageSize;
    //     const filter: any = {};
    //
    //     const [items, totalCount] = await Promise.all([
    //         PostModel
    //             .find(filter)
    //             .sort({ [sortBy]: sortDirection })
    //             .skip(skip)
    //             .limit(pageSize)
    //             .lean(),
    //         PostModel
    //             .countDocuments(filter)
    //     ]);
    //
    //     return mapToPostListPaginatedOutput(items, {
    //         pageNumber,
    //         pageSize,
    //         totalCount,
    //     });
    // }

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
            userLikes = await LikePostsModel.find({ postId: { $in: postIds }, userId }).lean();
        }

        const myStatusesMap = new Map<string, LikeStatus>(userLikes.map(l => [l.postId, l.status as LikeStatus]));

        const newestLikesDocs = await LikePostsModel.aggregate([
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

            return {
                id: postIdStr,
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    likesCount: post.extendedLikesInfo?.likesCount ?? 0,
                    dislikesCount: post.extendedLikesInfo?.dislikesCount ?? 0,
                    myStatus,
                    newestLikes: newestLikes.map(l => ({
                        addedAt: l.addedAt.toISOString(),
                        userId: l.userId,
                        login: l.login
                    }))
                }
            };
        });

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: mappedItems
        };
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

        let userLikes: any[] = [];

        if (userId) {
            userLikes = await LikeCommentsModel.find({
                commentId: { $in: postIds },
                userId: userId.toString()
            }).lean();
        }

        const likesMap = new Map<string, LikeStatus>(
            userLikes.map(like => [like.postId, like.status as LikeStatus])
        );

        const itemsWithCorrectStatus = items.map((item) => {
            const myStatus = likesMap.get(item._id.toString()) ?? LikeStatus.None;
            return mapToPostOutput(item, myStatus);
        });

        return mapToPostListPaginatedOutput(itemsWithCorrectStatus, {
            pageNumber,
            pageSize,
            totalCount,
        });
    }
}