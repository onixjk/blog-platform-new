import {WithId} from 'mongodb';
import {PostOutput} from "../output/post-output";
import {Post} from "../../types/post";
import {PostListPaginatedOutput} from "../output/post-list-paginated.output.ts";

export function mapToPostListPaginatedOutput(
    posts: WithId<Post>[],
    meta: { pageNumber: number; pageSize: number; totalCount: number },
): PostListPaginatedOutput {
    return {
        page: meta.pageNumber,
        pageSize: meta.pageSize,
        pageCount: Math.ceil(meta.totalCount / meta.pageSize),
        totalCount: meta.totalCount,
        items: posts.map(
            (post): PostOutput => ({
                id: post._id.toString(),
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
            }),
        ),
    };
}