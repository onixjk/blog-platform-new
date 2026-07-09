import { BlogInputDto } from "../types/input/blog.input-dto";
import { Blog } from "../types/blog";
import { WithId } from "mongodb";
import PostService from "../../post/application/postService";
import { BlogRepository } from "../repositories/blogRepository";
import { inject, injectable } from "inversify";
import { container } from "../../../composition-root";

@injectable()
export class BlogService {

    constructor(
        @inject(BlogRepository) private blogsRepository: BlogRepository,
        // @inject(PostService) private postService: PostService,
    ) {
    }

    async findByIdOrFail(id: string): Promise<WithId<Blog>> {
        return this.blogsRepository.findByIdOrFail(id);
    }

    async create(dto: BlogInputDto): Promise<string> {
        const newBlog: Blog = {
            name: dto.name,
            description: dto.description,
            websiteUrl: dto.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false,
        }

        return this.blogsRepository.create(newBlog);
    }

    async update(id: string, dto: BlogInputDto): Promise<void> {
        const postService = container.get(PostService);
        await postService.updateBlogName(id, dto.name);
        await this.blogsRepository.update(id, dto);

        return;
    }

    async delete(id: string): Promise<void> {
        const postService = container.get(PostService);
        await postService.deleteAllByBlogId(id)
        await this.blogsRepository.delete(id);

        return;
    }
}