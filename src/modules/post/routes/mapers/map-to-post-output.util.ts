import { PostOutput } from "../../types/output/post-output";
import { Post } from "../../types/post";
import { LikeStatus } from "../../../like/types/like-status";

export function mapToPostOutput(post: Post & { _id: any }, myStatus: LikeStatus, newestLikes: any[] = []): PostOutput {
    return {
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
            likesCount: post.extendedLikesInfo?.likesCount ?? 0,
            dislikesCount: post.extendedLikesInfo?.dislikesCount ?? 0,
            myStatus: myStatus,
            newestLikes: newestLikes.map(like => ({
                addedAt: like.addedAt instanceof Date ? like.addedAt.toISOString() : new Date(like.addedAt).toISOString(),
                userId: like.userId,
                login: like.login,
            }))
        },

    }
}