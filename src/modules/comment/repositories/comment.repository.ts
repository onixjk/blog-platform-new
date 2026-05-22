import {ObjectId, WithId} from "mongodb";
import {commentCollection} from "../../../db/mongo.db";
import {RepositoryNotFoundError} from "../../../core/errors/repository-not-found.error";
import {Comment} from "../types/comment";
import {CommentUpdateDto} from "../routers/input/comment-update.dto";

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

    async update(dto: CommentUpdateDto): Promise<void> {

        const updateResult = await commentCollection.updateOne(
            {
                _id: new ObjectId(dto.commentId)
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

    async delete(commentId: string): Promise<void> {

        const deleteResult = await commentCollection.deleteOne({_id: new ObjectId(commentId)});

        if (deleteResult.deletedCount < 1) {
            throw new RepositoryNotFoundError("Post not exist");
        }

        return;
    },

    async deleteAllByPostId(postId: string): Promise<void> {
        await commentCollection.deleteMany({postId: postId});
        return;
    }
}