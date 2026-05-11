import {BlogInputDto} from "../routers/input/blog.input-dto";
import {Blog} from "../types/blog";
import {WithId} from "mongodb";
import {blogsRepository} from "../repositories/blogs.repository";
import {BlogQueryInput} from "../routers/input/blog-query.input";
import {postsService} from "../../post/application/posts.service";
import {blogQueryRepository} from "../repositories/blog.query.repository";

export const blogsService = {
    async findMany(
        queryDto: BlogQueryInput,
    ): Promise<{ items: WithId<Blog>[]; totalCount: number }> {
        return blogQueryRepository.findMany(queryDto);
    },

    async findByIdOrFail(id: string): Promise<WithId<Blog>> {
        return blogQueryRepository.findByIdOrFail(id);
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