import {WithId} from "mongodb";
import {CommentCreateDto} from "../routers/input/comment-create.dto";
import {Comment} from "../types/comment";
import {commentRepository} from "../repositories/comment.repository";
import {usersService} from "../../user/application/usersService";
import {CommentUpdateDto} from "../routers/input/comment-update.dto";
import {Result} from "../../../core/result/result.type";
import {ResultStatus} from "../../../core/result/resultCode";

export const commentService = {

    async findByIdOrFail(id: string): Promise<WithId<Comment>> {
        return commentRepository.findByIdOrFail(id);
    },

    async create(dto: CommentCreateDto):
        // Promise<string>
        Promise<Result<string>>
    {
        // const postResult = await postsService.findByIdOrFail(dto.postId);

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
        const comment = await this.findByIdOrFail(dto.commentId);

        if (comment.commentatorInfo.userId !== dto.userId) {
            // throw new ForbiddenError("Access denied");

            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: 'Unauthorized',
                extensions: [{field: null, message: 'User is not authorized'}],
            }
        }

        return await commentRepository.update(dto);
    },

    async delete(id: string, userId: string): Promise<Result> {
        const comment = await this.findByIdOrFail(id);

        if (comment.commentatorInfo.userId !== userId) {
            // throw new ForbiddenError("Access denied");

            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: 'Unauthorized',
                extensions: [{field: null, message: 'User is not authorized'}],
            }
        }

        return await commentRepository.delete(id);
    },

    async deleteAllByPostId(postId: string): Promise<Result> {
        return await commentRepository.deleteAllByPostId(postId);
    }
}