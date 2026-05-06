import {PostOutput} from "./post-output";

export type PostListPaginatedOutput = {
    page: number;
    pageSize: number;
    pageCount: number;
    totalCount: number;
    items: PostOutput[];
};