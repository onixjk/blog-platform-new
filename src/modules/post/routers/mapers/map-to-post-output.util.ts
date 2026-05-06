import {WithId} from "mongodb";
import {PostOutput} from "../output/post-output";
import {Post} from "../../types/post";

export function mapToPostOutput(post: WithId<Post>): PostOutput {
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