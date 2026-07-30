import { PostOutput } from "../../types/output/post-output";
import { Post } from "../../types/post";
import { LikeStatus } from "../../../like/types/like-status";

export function mapToPostOutput(post: Post & { _id: any }, myStatus: LikeStatus): PostOutput {
    return {
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
            likesCount: post.extendedLikesInfo.likesCount,
            dislikesCount: post.extendedLikesInfo.dislikesCount,
            myStatus: myStatus,
            newestLikes: [{
                addedAt: post.extendedLikesInfo.newestLikes[0].addedAt,
                userId: post.extendedLikesInfo.newestLikes[0].userId,
                login: post.extendedLikesInfo.newestLikes[0].login,
            }]
        },

    }
}