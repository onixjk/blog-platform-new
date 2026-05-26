import {PostOutput} from "./post-output";

export type PostListPaginatedOutput = {
    page: number;
    pageSize: number;
    pagesCount: number;
    totalCount: number;
    items: PostOutput[];
};