import {ObjectId, WithId} from "mongodb";
import {postCollection} from "../../../db/mongo.db";
import {RepositoryNotFoundError} from "../../../core/errors/repository-not-found.error";
import {Post} from "../types/post";
import {PostInputDto} from "../routes/input/post.input-dto";
import {Result} from "../../../core/result/result.type";
import {ResultStatus} from "../../../core/result/resultCode";

export const postsRepository = {

    async findById(id: string): Promise<Result<WithId<Post> | null>> {
        const post = await postCollection.findOne({_id: new ObjectId(id)});

        if (!post) {
            return {
                status: ResultStatus.NotFound,
                data: null,
                errorMessage: 'Not Found',
                extensions: [{field: null, message: 'Post not exist'}],
            }
        }

        return {
            status: ResultStatus.Success,
            data: post,
            extensions: [],
        };
    },

    async findByIdOrFail(id: string): Promise<WithId<Post>> {
        const res = await postCollection.findOne({_id: new ObjectId(id)});

        if (!res) {
            throw new RepositoryNotFoundError('Post not exist');
        }

        return res;
    },

    async create(newPost: Post): Promise<string> {
        const insertResult = await postCollection.insertOne(newPost);

        return insertResult.insertedId.toString()
    },

    async update(id: string, dto: PostInputDto, blogName: string): Promise<void> {
        const updateResult = await postCollection.updateOne(
            {
                _id: new ObjectId(id)
            },
            {
                $set: {
                    title: dto.title,
                    shortDescription: dto.shortDescription,
                    content: dto.content,
                    blogId: dto.blogId,
                    blogName: blogName,
                }
            }
        );

        if (updateResult.matchedCount < 1) {
            throw new RepositoryNotFoundError("Post doesn't exist");
        }
        return;
    },

    async updateAllBlogNames(blogId: string, blogName: string): Promise<void> {
        await postCollection.updateMany(
            {
                blogId: blogId
            },
            {
                $set: {
                    blogName: blogName,
                }
            }
        );

        return;
    },

    async delete(id: string): Promise<void> {
        const deleteResult = await postCollection.deleteOne({_id: new ObjectId(id)});

        if (deleteResult.deletedCount < 1) {
            throw new RepositoryNotFoundError("Post not exist");
        }

        return;
    },

    async deleteAllByBlogId(blogId: string): Promise<void> {
        await postCollection.deleteMany({blogId: blogId});

        return;
    }
}