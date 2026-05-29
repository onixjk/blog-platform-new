import {WithId} from "mongodb";
import {CommentCreateDto} from "../routes/input/comment-create.dto";
import {Comment} from "../types/comment";
import {commentRepository} from "../repositories/comment.repository";
import {usersService} from "../../user/application/usersService";
import {CommentUpdateDto} from "../routes/input/comment-update.dto";
import {Result} from "../../../core/result/result.type";
import {ResultStatus} from "../../../core/result/resultCode";
import {postsService} from "../../post/application/posts.service";

export const commentService = {

    async findById(id: string): Promise<Result<WithId<Comment> | null>> {
        return commentRepository.findById(id);
    },

    async create(dto: CommentCreateDto): Promise<Result<string | null>> {
        const postResult = await postsService.findById(dto.postId);

        if (postResult.status === ResultStatus.NotFound || !postResult.data) {
            return {
                status: ResultStatus.NotFound,
                data: null,
                errorMessage: 'NotFound',
                extensions: [{field: null, message: 'Comment not exist'}],
            }
        }

        const user = await usersService.findByIdOrFail(dto.userId);

        const newComment: Comment = {
            postId: dto.postId,
            content: dto.content,
            commentatorInfo: {
                userId: dto.userId,
                userLogin: user.login
            },
            createdAt: new Date().toISOString(),
        }

        return commentRepository.create(newComment);
    },

    async update(dto: CommentUpdateDto): Promise<Result> {
        
        const result = await this.findById(dto.commentId);

        if (result.status === ResultStatus.NotFound || !result.data) {
            return {
                status: ResultStatus.NotFound,
                data: null,
                errorMessage: 'NotFound',
                extensions: [{field: null, message: 'Comment not exist'}],
            }
        }

        if (result.data.commentatorInfo.userId !== dto.userId) {
            return {
                status: ResultStatus.Forbidden,
                data: null,
                errorMessage: 'Forbidden',
                extensions: [{field: null, message: 'You try to update someone else\'s comment'}],
            }
        }

        return await commentRepository.update(dto);
    },

    async delete(id: string, userId: string): Promise<Result<WithId<Comment> | null>> {
        const commentResult = await this.findById(id);

        if (commentResult.status === ResultStatus.NotFound || !commentResult.data) {
            return {
                status: ResultStatus.NotFound,
                data: null,
                errorMessage: 'Not Found',
                extensions: [{ field: null, message: 'Comment doesn\'t exist' }],
            };
        }

        if (commentResult.data.commentatorInfo.userId !== userId) {
            return {
                status: ResultStatus.Forbidden,
                data: null,
                errorMessage: 'Forbidden',
                extensions: [{field: null, message: 'You try to delete someone else\'s comment'}],
            }
        }

        return await commentRepository.delete(id);
    },

    async deleteAllByPostId(postId: string): Promise<Result> {
        return await commentRepository.deleteAllByPostId(postId);
    }
}