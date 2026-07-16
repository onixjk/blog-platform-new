import { Blog } from "../../types/blog";
import { BlogOutput } from "../../types/output/blog-output";
import { BlogListPaginatedOutput } from "../../types/output/blog-list-paginated.output";

export function mapToBlogListPaginatedOutput(
    blogs: (Blog & { _id: any })[],
    meta: { pageNumber: number; pageSize: number; totalCount: number },
): BlogListPaginatedOutput {
    return {
        pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
        page: meta.pageNumber,
        pageSize: meta.pageSize,
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