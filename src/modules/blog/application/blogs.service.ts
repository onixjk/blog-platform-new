import { BlogInputDto } from "../types/input/blog.input-dto";
import { Blog } from "../types/blog";
import { WithId } from "mongodb";
import { blogsRepository, postsService } from "../../../composition-root";
import { PostsService } from "../../post/application/posts.service";
import { BlogsRepository } from "../repositories/blogs.repository";

export class BlogsService {

    constructor(
        public blogsRepository: BlogsRepository,
        public postsService: PostsService,
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