import { WithId } from "mongodb";
import { PostInputDto } from "../types/input/post.input-dto";
import { Post } from "../types/post";
import { Result } from "../../../core/result/result.type";
import { inject, injectable } from "inversify";
import { PostRepository } from "../repositories/post.repository";
import { BlogService } from "../../blog/application/blog.service";
import { CommentRepository } from "../../comment/repositories/comment.repository";

@injectable()
export class PostService {

    constructor(
        @inject(PostRepository) private postRepository: PostRepository,
        @inject(BlogService) private blogService: BlogService,
        @inject(CommentRepository) private commentRepository: CommentRepository,
    ) {
    }

    async findById(id: string): Promise<Result<WithId<Post> | null>> {
        return this.postRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<WithId<Post>> {
        return this.postRepository.findByIdOrFail(id);
    }

    async create(dto: PostInputDto): Promise<string> {
        const blog = await this.blogService.findByIdOrFail(dto.blogId);

        const newPost: Post = {
            title: dto.title,
            shortDescription: dto.shortDescription,
            content: dto.content,
            blogId: dto.blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString(),
        }

        return this.postRepository.create(newPost);
    }

    async update(id: string, dto: PostInputDto): Promise<void> {
        const blog = await this.blogService.findByIdOrFail(dto.blogId);

        await this.postRepository.update(id, dto, blog.name);
        return;
    }

    async updateBlogName(blogId: string, blogName: string): Promise<void> {
        await this.postRepository.updateAllBlogNames(blogId, blogName);

        return;
    }

    async delete(id: string): Promise<void> {
        await this.commentRepository.deleteAllByPostId(id)
        await this.postRepository.delete(id);
        return;
    }

    async deleteAllByBlogId(blogId: string): Promise<void> {
        await this.postRepository.deleteAllByBlogId(blogId);
        return;
    }
}

export default PostService