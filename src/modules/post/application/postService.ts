import { WithId } from "mongodb";
import { PostInputDto } from "../types/input/post.input-dto";
import { Post } from "../types/post";
import { Result } from "../../../core/result/result.type";
import { inject, injectable } from "inversify";
import { PostRepository } from "../repositories/post.repository";
import { BlogService } from "../../blog/application/blog.service";
import { CommentRepository } from "../../comment/repositories/comment.repository";

@injectable()
class PostService {

    constructor(
        @inject(PostRepository) private postsRepository: PostRepository,
        @inject(BlogService) private blogsService: BlogService,
        @inject(CommentRepository) private commentRepository: CommentRepository,
    ) {
    }

    async findById(id: string): Promise<Result<WithId<Post> | null>> {
        return this.postsRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<WithId<Post>> {
        return this.postsRepository.findByIdOrFail(id);
    }

    async create(dto: PostInputDto): Promise<string> {
        const blog = await this.blogsService.findByIdOrFail(dto.blogId);

        const newPost: Post = {
            title: dto.title,
            shortDescription: dto.shortDescription,
            content: dto.content,
            blogId: dto.blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString(),
        }

        return this.postsRepository.create(newPost);
    }

    async update(id: string, dto: PostInputDto): Promise<void> {
        const blog = await this.blogsService.findByIdOrFail(dto.blogId);

        await this.postsRepository.update(id, dto, blog.name);
        return;
    }

    async updateBlogName(blogId: string, blogName: string): Promise<void> {
        await this.postsRepository.updateAllBlogNames(blogId, blogName);

        return;
    }

    async delete(id: string): Promise<void> {
        await this.commentRepository.deleteAllByPostId(id)
        await this.postsRepository.delete(id);
        return;
    }

    async deleteAllByBlogId(blogId: string): Promise<void> {
        await this.postsRepository.deleteAllByBlogId(blogId);
        return;
    }
}

export default PostService