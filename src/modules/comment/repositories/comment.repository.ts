import {ObjectId, WithId} from "mongodb";
import {commentCollection} from "../../../db/mongo.db";
import {RepositoryNotFoundError} from "../../../core/errors/repository-not-found.error";
import {Comment} from "../types/comment";
import {CommentUpdateDto} from "../routers/input/comment-update.dto";
import {ResultStatus} from "../../../core/result/resultCode";
import {Result} from "../../../core/result/result.type";
import {IUserDB} from "../../user/types/user.db.interface";

export const commentRepository = {

    async findByIdOrFail(id: string): Promise<WithId<Comment>> {
        const comment = await commentCollection.findOne({_id: new ObjectId(id)});

        if (!comment) {
            throw new RepositoryNotFoundError('Comment not exist');

            // return {
            //     status: ResultStatus.NotFound,
            //     data: null,
            //     errorMessage: 'Not Found',
            //     extensions: [{field: null, message: 'Comment not exist'}],
            // }
        }

        return comment;
        // return {
        //     status: ResultStatus.Success,
        //     data: comment,
        //     extensions: [],
        // };
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