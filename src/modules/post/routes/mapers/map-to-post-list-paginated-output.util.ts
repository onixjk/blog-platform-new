import { PostOutput } from "../../types/output/post-output";
import { PostListPaginatedOutput } from "../../types/output/post-list-paginated.output";

export function mapToPostListPaginatedOutput(
    items: PostOutput[],
    meta: { pageNumber: number; pageSize: number; totalCount: number },
): PostListPaginatedOutput {
    return {
        pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
        page: meta.pageNumber,
        pageSize: meta.pageSize,
        totalCount: meta.totalCount,
        items: items,
    };
}