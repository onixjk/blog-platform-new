import { WithId } from "mongodb";
import { PostInputDto } from "../types/input/post.input-dto";
import { Post } from "../types/post";
import { Result } from "../../../core/result/result.type";
import { PostsRepository } from "../repositories/posts.repository";
import { inject, injectable } from "inversify";
import { BlogsService } from "../../blog/application/blogs.service";
import { CommentService } from "../../comment/application/comment.service";
import { container } from "../../../composition-root";

const postsRepository = container.get(PostsRepository);
const blogsService = container.get(BlogsService);
const commentService = container.get(CommentService);

@injectable()
export class PostsService {

    constructor(
        @inject(PostsRepository) public postRepository: PostsRepository,
        @inject(BlogsService) public blogsService: BlogsService,
        @inject(CommentService) public commentService: CommentService,
    ) {
    }

    async findById(id: string): Promise<Result<WithId<Post> | null>> {
        return postsRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<WithId<Post>> {
        return postsRepository.findByIdOrFail(id);
    }

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
    }

    async update(id: string, dto: PostInputDto): Promise<void> {
        const blog = await blogsService.findByIdOrFail(dto.blogId);

        await postsRepository.update(id, dto, blog.name);
        return;
    }

    async updateBlogName(blogId: string, blogName: string): Promise<void> {
        await postsRepository.updateAllBlogNames(blogId, blogName);

        return;
    }

    async delete(id: string): Promise<void> {
        await commentService.deleteAllByPostId(id)
        await postsRepository.delete(id);
        return;
    }

    async deleteAllByBlogId(blogId: string): Promise<void> {
        await postsRepository.deleteAllByBlogId(blogId);
        return;
    }
}