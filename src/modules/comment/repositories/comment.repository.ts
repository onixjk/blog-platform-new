import {ObjectId, WithId} from "mongodb";
import {commentCollection} from "../../../db/mongo.db";
import {RepositoryNotFoundError} from "../../../core/errors/repository-not-found.error";
import {Comment} from "../types/comment";
import {ForbiddenError} from "../../../core/errors/repository-forbidden.error";
import {CommentInputDto} from "../routers/input/comment-input.dto";
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
        const comment = await this.findByIdOrFail(dto.commentId);

        if (comment.commentatorInfo.userId !== dto.userId) {
            throw new ForbiddenError("Access denied");                //todo
        }

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

    async delete(commentId: string, userId: string): Promise<void> {
        const comment = await this.findByIdOrFail(commentId);

        if (comment.commentatorInfo.userId !== userId) {
            throw new ForbiddenError("Access denied");                //todo
        }

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