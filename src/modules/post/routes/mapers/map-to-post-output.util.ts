import { PostOutput } from "../../types/output/post-output";
import { Post } from "../../types/post";

export function mapToPostOutput(post: Post & { _id: any }): PostOutput {
    return {
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
    }
}