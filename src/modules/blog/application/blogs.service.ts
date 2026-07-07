import { BlogInputDto } from "../types/input/blog.input-dto";
import { Blog } from "../types/blog";
import { WithId } from "mongodb";
import { PostsService } from "../../post/application/posts.service";
import { BlogsRepository } from "../repositories/blogs.repository";
import { inject, injectable } from "inversify";
import { container } from "../../../composition-root";

// const blogsRepository = container.get(BlogsRepository);
// const postsService = container.get(PostsService);

@injectable()
export class BlogsService {

    constructor(
        @inject(BlogsRepository) private blogsRepository: BlogsRepository,
        @inject(PostsService) private postsService: PostsService,
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
        await this.postsService.updateBlogName(id, dto.name);
        await this.blogsRepository.update(id, dto);

        return;
    }

    async delete(id: string): Promise<void> {
        await this.postsService.deleteAllByBlogId(id)
        await this.blogsRepository.delete(id);

        return;
    }
}