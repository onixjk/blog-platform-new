import { ObjectId, WithId } from "mongodb";
import { commentCollection } from "../../../db/mongo.db";
import { Comment } from "../types/comment";
import { CommentUpdateDto } from "../types/input/comment-update.dto";
import { ResultStatus } from "../../../core/result/resultCode";
import { Result } from "../../../core/result/result.type";
import { injectable } from "inversify";

@injectable()
export class CommentRepository {

    async findById(id: string): Promise<Result<WithId<Comment> | null>> {
        const comment = await commentCollection.findOne({ _id: new ObjectId(id) });

        if (!comment) {
            return {
                status: ResultStatus.NotFound_404,
                data: null,
                errorMessage: 'Not Found',
                extensions: [{ field: null, message: 'Comment not exist' }],
            }
        }

        return {
            status: ResultStatus.Success_200,
            data: comment,
            extensions: [],
        };
    }

    async create(newComment: Comment): Promise<Result<string>> {
        const insertResult = await commentCollection.insertOne(newComment);

        return {
            status: ResultStatus.Created_201,
            data: insertResult.insertedId.toString(),
            extensions: [],
        }
    }

    async update(dto: CommentUpdateDto): Promise<Result> {
        const updateResult = await commentCollection.updateOne(
            { _id: new ObjectId(dto.commentId) },
            { $set: { content: dto.content, } }
        );

        if (updateResult.matchedCount < 1) {
            return {
                status: ResultStatus.NotFound_404,
                data: null,
                errorMessage: 'Not Found',
                extensions: [{ field: null, message: 'Comment doesn\'t exist' }],
            }
        }

        return {
            status: ResultStatus.NoContent_204,
            data: null,
            extensions: [],
        }
    }

    async delete(commentId: string): Promise<Result> {
        const deleteResult = await commentCollection.deleteOne({ _id: new ObjectId(commentId) });

        if (deleteResult.deletedCount < 1) {
            return {
                status: ResultStatus.NotFound_404,
                data: null,
                errorMessage: 'Not Found',
                extensions: [{ field: null, message: 'Comment doesn\'t exist' }],
            }
        }

        return {
            status: ResultStatus.NoContent_204,
            data: null,
            extensions: [],
        }
    }

    async deleteAllByPostId(postId: string): Promise<Result> {
        await commentCollection.deleteMany({ postId: postId });

        return {
            status: ResultStatus.NoContent_204,
            data: null,
            extensions: [],
        };
    }
}