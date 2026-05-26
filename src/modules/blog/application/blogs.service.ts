import {BlogInputDto} from "../routes/input/blog.input-dto";
import {Blog} from "../types/blog";
import {WithId} from "mongodb";
import {blogsRepository} from "../repositories/blogs.repository";
import {BlogQueryInput} from "../routes/input/blog-query.input";
import {postsService} from "../../post/application/posts.service";
import {blogsQueryRepository} from "../repositories/blogs.query.repository";
import {BlogListPaginatedOutput} from "../routes/output/blog-list-paginated.output.ts";

export const blogsService = {
    async findMany(
        queryDto: BlogQueryInput,
    ): Promise<BlogListPaginatedOutput> {
        return blogsQueryRepository.findMany(queryDto);
    },

    async findByIdOrFail(id: string): Promise<WithId<Blog>> {
        return blogsRepository.findByIdOrFail(id);
    },

    async create(dto: BlogInputDto): Promise<string> {
        const newBlog: Blog = {
            name: dto.name,
            description: dto.description,
            websiteUrl: dto.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false,
        }

        return blogsRepository.create(newBlog);
    },

    async update(id: string, dto: BlogInputDto): Promise<void> {
        await postsService.updateBlogName(id, dto.name);
        await blogsRepository.update(id, dto);

        return;
    },

    async delete(id: string): Promise<void> {
        await postsService.deleteAllByBlogId(id)
        await blogsRepository.delete(id);

        return;
    }
}