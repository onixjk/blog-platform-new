import { BlogInputDto } from "../types/input/blog.input-dto";
import { Blog } from "../types/blog";
import { WithId } from "mongodb";
import { BlogRepository } from "../repositories/blogRepository";
import { inject, injectable } from "inversify";
import { PostRepository } from "../../post/repositories/post.repository";

@injectable()
export class BlogService {

    constructor(
        @inject(BlogRepository) private blogRepository: BlogRepository,
        @inject(PostRepository) private postRepository: PostRepository,
    ) {
    }

    async findByIdOrFail(id: string): Promise<WithId<Blog>> {
        return this.blogRepository.findByIdOrFail(id);
    }

    async create(dto: BlogInputDto): Promise<string> {
        const newBlog: Blog = {
            name: dto.name,
            description: dto.description,
            websiteUrl: dto.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false,
        }

        return this.blogRepository.create(newBlog);
    }

    async update(id: string, dto: BlogInputDto): Promise<void> {
        await this.postRepository.updateAllBlogNames(id, dto.name);
        await this.blogRepository.update(id, dto);

        return;
    }

    async delete(id: string): Promise<void> {
        await this.postRepository.deleteAllByBlogId(id)
        await this.blogRepository.delete(id);

        return;
    }
}