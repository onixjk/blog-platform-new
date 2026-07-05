import {WithId} from "mongodb";
import {CommentListPaginatedOutput} from "../../types/output/comment-list-paginated.output";
import {CommentOutput} from "../../types/output/comment-output";
import {Comment} from "../../types/comment";

export function mapToCommentListPaginatedOutput(
    comments: WithId<Comment>[],
    meta: { pageNumber: number; pageSize: number; totalCount: number },
): CommentListPaginatedOutput {
    return {
        pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
        page: meta.pageNumber,
        pageSize: meta.pageSize,
        totalCount: meta.totalCount,
        items: comments.map(
            (comment): CommentOutput => ({
                id: comment._id.toString(),
                content: comment.content,
                commentatorInfo: comment.commentatorInfo,
                createdAt: comment.createdAt,
            }),
        ),
    };
}