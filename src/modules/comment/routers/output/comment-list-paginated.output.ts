import {CommentOutput} from "./comment-output";

export type CommentListPaginatedOutput = {
    page: number;
    pageSize: number;
    pagesCount: number;
    totalCount: number;
    items: CommentOutput[];
};