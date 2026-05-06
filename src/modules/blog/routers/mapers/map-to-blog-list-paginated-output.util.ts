import {WithId} from 'mongodb';
import {Blog} from "../../types/blog";
import {BlogOutput} from "../output/blog-output";
import {BlogListPaginatedOutput} from "../output/blog-list-paginated.output.ts";

export function mapToBlogListPaginatedOutput(
    blogs: WithId<Blog>[],
    meta: { pageNumber: number; pageSize: number; totalCount: number },
): BlogListPaginatedOutput {
    return {
        page: meta.pageNumber,
        pageSize: meta.pageSize,
        pageCount: Math.ceil(meta.totalCount / meta.pageSize),
        totalCount: meta.totalCount,
        items: blogs.map(
            (blog): BlogOutput => ({
                id: blog._id.toString(),
                name: blog.name,
                description: blog.description,
                websiteUrl: blog.websiteUrl,
                createdAt: blog.createdAt,
                isMembership: blog.isMembership,
            }),
        ),
    };
}