import { BlogInputDto } from "../types/input/blog.input-dto";
import { Blog } from "../types/blog";
import { BlogRepository } from "../repositories/blogRepository";
import { inject, injectable } from "inversify";
import { PostRepository } from "../../post/repositories/post.repository";
import { BlogModel } from "../../../db/mongo.db";
import { ResultStatus } from "../../../core/result/resultCode";
import { Result } from "../../../core/result/result.type";
import { HydratedDocument } from "mongoose";

@injectable()
export class BlogService {

    constructor(
        @inject(BlogRepository) private blogRepository: BlogRepository,
        @inject(PostRepository) private postRepository: PostRepository,
    ) {}

    async findById(id: string): Promise<Result<HydratedDocument<Blog> | null>> {

        const blog = await this.blogRepository.findById(id);
        if (!blog) {
            return {
                status: ResultStatus.NotFound_404,
                errorMessage: 'Not Found',
                data: null,
                extensions: [{ field: 'Blog', message: 'Blog not found' }]
            };
        }

        return {
            status: ResultStatus.Success,
            data: blog,
            extensions: []
        };
    }

    async create(dto: BlogInputDto): Promise<Result<string | null>> {

        const newBlog = new BlogModel({
            name: dto.name,
            description: dto.description,
            websiteUrl: dto.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false,
        });

        const savedBlogId = await this.blogRepository.save(newBlog);
        if (!savedBlogId) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: 'Blog', message: 'Blog not found' }]
            };
        }

        return {
            status: ResultStatus.Success,
            data: savedBlogId,
            extensions: []
        };
    }

    async update(id: string, dto: BlogInputDto): Promise<Result<string | null>> {

        const blog = await this.blogRepository.findById(id);
        if (!blog) {
            return {
                status: ResultStatus.NotFound_404,
                errorMessage: 'Not Found',
                data: null,
                extensions: [{ field: 'Blog', message: 'Blog not exist' }]
            };
        }

        blog.name = dto.name;
        blog.description = dto.description;
        blog.websiteUrl = dto.websiteUrl;

        const savedBlogId = await this.blogRepository.save(blog);
        if (!savedBlogId) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'BadRequest',
                data: null,
                extensions: [{ field: 'Blog', message: 'Blog update failed' }]
            };
        }

        await this.postRepository.updateAllBlogNames(id, dto.name);

        return {
            status: ResultStatus.Success,
            data: savedBlogId,
            extensions: []
        };
    }

    async delete(id: string): Promise<Result<boolean | null>> {

        const isDeleted = await this.blogRepository.delete(id);
        if (!isDeleted) {
            return {
                status: ResultStatus.NotFound_404,
                errorMessage: 'Not Found',
                data: null,
                extensions: [{ field: 'Blog', message: 'Blog not exist' }]
            };
        }

        await this.postRepository.deleteAllByBlogId(id);

        return {
            status: ResultStatus.Success,
            data: isDeleted,
            extensions: []
        };
    }
}