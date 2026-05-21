import {ObjectId, WithId} from "mongodb";
import {commentCollection, postCollection} from "../../../db/mongo.db";
import {RepositoryNotFoundError} from "../../../core/errors/repository-not-found.error";
import {Comment} from "../types/comment";
import {CommentInputDto} from "../routers/input/comment.input-dto";

export const commentRepository = {

    async findByIdOrFail(id: string): Promise<WithId<Comment>> {
        const res = await commentCollection.findOne({_id: new ObjectId(id)});

        if (!res) {
            throw new RepositoryNotFoundError('Comment not exist');
        }

        return res;
    },

    async create(newComment: Comment): Promise<string> {
        const insertResult = await commentCollection.insertOne(newComment);

        return insertResult.insertedId.toString()
    },

    async update(id: string, dto: CommentInputDto): Promise<void> {
        const updateResult = await commentCollection.updateOne(
            {
                _id: new ObjectId(id)
            },
            {
                $set: {
                    content: dto.content,
                }
            }
        );

        if (updateResult.matchedCount < 1) {
            throw new RepositoryNotFoundError("Comment doesn't exist");
        }
        return;
    },

    // async updateAllBlogNames(blogId: string, blogName: string): Promise<void> {
    //     await postCollection.updateMany(
    //         {
    //             blogId: blogId
    //         },
    //         {
    //             $set: {
    //                 blogName: blogName,
    //             }
    //         }
    //     );
    //
    //     return;
    // },

    async delete(id: string): Promise<void> {
        const deleteResult = await postCollection.deleteOne({_id: new ObjectId(id)});

        if (deleteResult.deletedCount < 1) {
            throw new RepositoryNotFoundError("Post not exist");
        }

        return;
    },

    // async deleteAllByPostId(postId: string): Promise<void> {
    //     await commentCollection.deleteMany({postId: postId});
    //
    //     return;
    // }
}