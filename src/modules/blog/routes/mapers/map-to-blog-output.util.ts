import { Blog } from "../../types/blog";
import { BlogOutput } from "../../types/output/blog-output";

export function mapToBlogOutput(blog: Blog & { _id: any }): BlogOutput {
    return {
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: false,
    };
}