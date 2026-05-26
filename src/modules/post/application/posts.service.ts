import {WithId} from "mongodb";
import {postsRepository} from "../repositories/posts.repository";
import {blogsService} from "../../blog/application/blogs.service";
import {PostInputDto} from "../routes/input/post.input-dto";
import {Post} from "../types/post";
import {commentService} from "../../comment/application/comment.service";
import {Result} from "../../../core/result/result.type";

export const postsService = {

    async findById(id: string): Promise<Result<WithId<Post> | null>> {
        return postsRepository.findById(id);
    },

    async findByIdOrFail(id: string): Promise<WithId<Post>> {
        return postsRepository.findByIdOrFail(id);
    },

    async create(dto: PostInputDto): Promise<string> {
        const blog = await blogsService.findByIdOrFail(dto.blogId);

        const newPost: Post = {
            title: dto.title,
            shortDescription: dto.shortDescription,
            content: dto.content,
            blogId: dto.blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString(),
        }

        return postsRepository.create(newPost);
    },

    async update(id: string, dto: PostInputDto): Promise<void> {
        const blog = await blogsService.findByIdOrFail(dto.blogId);

        await postsRepository.update(id, dto, blog.name);
        return;
    },

    async updateBlogName(blogId: string, blogName: string): Promise<void> {
        await postsRepository.updateAllBlogNames(blogId, blogName);

        return;
    },

    async delete(id: string): Promise<void> {
        await commentService.deleteAllByPostId(id)
        await postsRepository.delete(id);
        return;
    },

    async deleteAllByBlogId(blogId: string): Promise<void> {
        await postsRepository.deleteAllByBlogId(blogId);
        return;
    }
}