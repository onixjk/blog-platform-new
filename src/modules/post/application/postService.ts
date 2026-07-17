import { PostInputDto } from "../types/input/post.input-dto";
import { Post } from "../types/post";
import { Result } from "../../../core/result/result.type";
import { inject, injectable } from "inversify";
import { PostRepository } from "../repositories/post.repository";
import { CommentRepository } from "../../comment/repositories/comment.repository";
import { ResultStatus } from "../../../core/result/resultCode";
import { PostModel } from "../../../db/mongo.db";
import { HydratedDocument } from "mongoose";
import { Blog } from "../../blog/types/blog";
import { BlogRepository } from "../../blog/repositories/blogRepository";

@injectable()
export class PostService {

    constructor(
        @inject(PostRepository) private postRepository: PostRepository,
        @inject(CommentRepository) private commentRepository: CommentRepository,
        @inject(BlogRepository) private blogRepository: BlogRepository,
    ) {}

    async findById(id: string): Promise<Result<HydratedDocument<Post> | null>> {

        const post = await this.postRepository.findById(id);
        if (!post) {
            return {
                status: ResultStatus.NotFound_404,
                errorMessage: 'NotFound',
                data: null,
                extensions: [{ field: 'Post', message: 'Post not exist' }]
            };
        }

        return {
            status: ResultStatus.Success,
            data: post,
            extensions: []
        };
    }

    async create(dto: PostInputDto): Promise<Result<string | null>> {

        const blog = await this.blogRepository.findById(dto.blogId);
        if (!blog) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: 'Blog', message: 'Blog not exist' }]
            };
        }

        const newPost = new PostModel({
            title: dto.title,
            shortDescription: dto.shortDescription,
            content: dto.content,
            blogId: dto.blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString(),
        })

        const savedPostId = await this.postRepository.save(newPost);

        return {
            status: ResultStatus.Success,
            data: savedPostId,
            extensions: []
        };
    }

    async update(id: string, dto: PostInputDto): Promise<Result<string | null>> {

        const blog = await this.blogRepository.findById(dto.blogId);
        if (!blog) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: 'blogId', message: 'Blog not exist' }]
            };
        }

        const post = await this.postRepository.findById(id);
        if (!post) {
            return {
                status: ResultStatus.NotFound_404,
                errorMessage: 'NotFound',
                data: null,
                extensions: [{ field: 'Post', message: 'Post not exist' }]
            };
        }

        post.set({
            title: dto.title,
            shortDescription: dto.shortDescription,
            content: dto.content,
            blogId: dto.blogId,
            blogName: blog.name,
        })

        const savedPostId = await this.postRepository.save(post);

        return {
            status: ResultStatus.Success,
            data: savedPostId,
            extensions: []
        };
    }

    // async updateAllBlogNames(blogId: string, blogName: string): Promise<Result<boolean | null>> {
    //
    //     const areAllUpdated = await this.postRepository.updateAllBlogNames(blogId, blogName);
    //
    //     return {
    //         status: ResultStatus.Success,
    //         data: areAllUpdated,
    //         extensions: []
    //     };
    // }

    async delete(id: string): Promise<Result<boolean | null>> {

        const isDeleted = await this.postRepository.delete(id);
        if (!isDeleted) {
            return {
                status: ResultStatus.NotFound_404,
                errorMessage: 'Not Found',
                data: null,
                extensions: [{ field: 'Post', message: 'Post not exist' }]
            };
        }

        await this.commentRepository.deleteAllByPostId(id)

        return {
            status: ResultStatus.Success,
            data: isDeleted,
            extensions: []
        };
    }

    // async deleteAllByBlogId(blogId: string): Promise<Result<boolean | null>> {
    //
    //     const isAllDeleted = await this.postRepository.deleteAllByBlogId(blogId);
    //
    //     return {
    //         status: ResultStatus.Success,
    //         data: isAllDeleted,
    //         extensions: []
    //     };
    // }
}