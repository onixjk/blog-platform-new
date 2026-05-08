import {BlogOutput} from "./blog-output";

export type BlogListPaginatedOutput = {
    page: number;
    pageSize: number;
    pagesCount: number;
    totalCount: number;
    items: BlogOutput[];
};