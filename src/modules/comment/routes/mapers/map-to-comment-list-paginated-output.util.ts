import { CommentListPaginatedOutput } from "../../types/output/comment-list-paginated.output";
import { CommentOutput } from "../../types/output/comment-output";

export function mapToCommentListPaginatedOutput(
    items: CommentOutput[],
    meta: { pageNumber: number; pageSize: number; totalCount: number },
): CommentListPaginatedOutput {
    return {
        pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
        page: meta.pageNumber,
        pageSize: meta.pageSize,
        totalCount: meta.totalCount,
        items: items,
    };
}