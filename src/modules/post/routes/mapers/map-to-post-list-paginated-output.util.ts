import {WithId} from 'mongodb';
import {PostOutput} from "../../types/output/post-output";
import {Post} from "../../types/post";
import {PostListPaginatedOutput} from "../../types/output/post-list-paginated.output";

export function mapToPostListPaginatedOutput(
    posts: WithId<Post>[],
    meta: { pageNumber: number; pageSize: number; totalCount: number },
): PostListPaginatedOutput {
    return {
        pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
        page: meta.pageNumber,
        pageSize: meta.pageSize,
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