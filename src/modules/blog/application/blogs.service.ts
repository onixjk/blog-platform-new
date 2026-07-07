import { BlogInputDto } from "../types/input/blog.input-dto";
import { Blog } from "../types/blog";
import { WithId } from "mongodb";
import { PostsService } from "../../post/application/posts.service";
import { BlogsRepository } from "../repositories/blogs.repository";
import { inject, injectable } from "inversify";
import { container } from "../../../composition-root";

const blogsRepository = container.get(BlogsRepository);
const postsService = container.get(PostsService);

@injectable()
export class BlogsService {

    constructor(
        @inject(BlogsRepository) public blogsRepository: BlogsRepository,
        @inject(PostsService) public postsService: PostsService,
    ) {
    }

    async findByIdOrFail(id: string): Promise<WithId<Blog>> {
        return blogsRepository.findByIdOrFail(id);
    }

    async create(dto: BlogInputDto): Promise<string> {
        const newBlog: Blog = {
            name: dto.name,
            description: dto.description,
            websiteUrl: dto.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false,
        }

        return blogsRepository.create(newBlog);
    }

    async update(id: string, dto: BlogInputDto): Promise<void> {
        await postsService.updateBlogName(id, dto.name);
        await blogsRepository.update(id, dto);

        return;
    }

    async delete(id: string): Promise<void> {
        await postsService.deleteAllByBlogId(id)
        await blogsRepository.delete(id);

        return;
    }
}