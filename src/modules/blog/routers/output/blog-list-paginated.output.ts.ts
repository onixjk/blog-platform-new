import {BlogOutput} from "./blog-output";

export type BlogListPaginatedOutput = {
    page: number;
    pageSize: number;
    pageCount: number;
    totalCount: number;
    items: BlogOutput[];
};