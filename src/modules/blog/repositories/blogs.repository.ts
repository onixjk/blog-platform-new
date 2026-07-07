import { blogCollection } from "../../../db/mongo.db";
import { ObjectId, WithId } from "mongodb";
import { BlogInputDto } from "../types/input/blog.input-dto";
import { Blog } from "../types/blog";
import { RepositoryNotFoundError } from "../../../core/errors/repository-not-found.error";
import { injectable } from "inversify";

@injectable()
export class BlogsRepository {

    async findByIdOrFail(id: string): Promise<WithId<Blog>> {
        const blog = await blogCollection.findOne({ _id: new ObjectId(id) });

        if (!blog) {
            throw new RepositoryNotFoundError('Blog not exist');
        }

        return blog;
    }

    async create(newBlog: Blog): Promise<string> {
        const insertResult = await blogCollection.insertOne(newBlog)

        return insertResult.insertedId.toString();
    }

    async update(id: string, dto: BlogInputDto): Promise<void> {
        const updateResult = await blogCollection.updateOne(
            {
                _id: new ObjectId(id),
            },
            {
                $set: {
                    name: dto.name,
                    description: dto.description,
                    websiteUrl: dto.websiteUrl,
                },
            },
        );

        if (updateResult.matchedCount < 1) {
            throw new RepositoryNotFoundError('Blog not exist');
        }

        return;
    }

    async delete(id: string): Promise<void> {
        const deleteResult = await blogCollection.deleteOne({ _id: new ObjectId(id) });

        if (deleteResult.deletedCount < 1) {
            throw new RepositoryNotFoundError('Blog not exist');
        }
        return;
    }
}