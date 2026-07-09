import { WithId } from "mongodb";
import { CommentCreateDto } from "../types/input/comment-create.dto";
import { Comment } from "../types/comment";
import { CommentRepository } from "../repositories/comment.repository";
import { CommentUpdateDto } from "../types/input/comment-update.dto";
import { Result } from "../../../core/result/result.type";
import { ResultStatus } from "../../../core/result/resultCode";
import { inject, injectable } from "inversify";
import { PostService } from "../../post/application/postService";
import { UserService } from "../../user/application/user.service";

@injectable()
export class CommentService {

    constructor(
        @inject(CommentRepository) private commentRepository: CommentRepository,
        @inject(UserService) private usersService: UserService,
        @inject(PostService) private postsService: PostService,
    ) {
    }

    async findById(id: string): Promise<Result<WithId<Comment> | null>> {
        return this.commentRepository.findById(id);
    }

    async create(dto: CommentCreateDto): Promise<Result<string | null>> {
        const postResult = await this.postsService.findById(dto.postId);

        if (postResult.status === ResultStatus.NotFound_404 || !postResult.data) {
            return {
                status: ResultStatus.NotFound_404,
                data: null,
                errorMessage: 'NotFound',
                extensions: [{ field: null, message: 'Comment not exist' }],
            }
        }

        const user = await this.usersService.findByIdOrFail(dto.userId);

        const newComment: Comment = {
            postId: dto.postId,
            content: dto.content,
            commentatorInfo: {
                userId: dto.userId,
                userLogin: user.login
            },
            createdAt: new Date().toISOString(),
        }

        return this.commentRepository.create(newComment);
    }

    async update(dto: CommentUpdateDto): Promise<Result> {

        const result = await this.findById(dto.commentId);

        if (result.status === ResultStatus.NotFound_404 || !result.data) {
            return {
                status: ResultStatus.NotFound_404,
                data: null,
                errorMessage: 'NotFound',
                extensions: [{ field: null, message: 'Comment not exist' }],
            }
        }

        if (result.data.commentatorInfo.userId !== dto.userId) {
            return {
                status: ResultStatus.Forbidden_403,
                data: null,
                errorMessage: 'Forbidden',
                extensions: [{ field: null, message: 'You try to update someone else\'s comment' }],
            }
        }

        return await this.commentRepository.update(dto);
    }

    async delete(id: string, userId: string): Promise<Result<WithId<Comment> | null>> {
        const commentResult = await this.findById(id);

        if (commentResult.status === ResultStatus.NotFound_404 || !commentResult.data) {
            return {
                status: ResultStatus.NotFound_404,
                data: null,
                errorMessage: 'Not Found',
                extensions: [{ field: null, message: 'Comment doesn\'t exist' }],
            };
        }

        if (commentResult.data.commentatorInfo.userId !== userId) {
            return {
                status: ResultStatus.Forbidden_403,
                data: null,
                errorMessage: 'Forbidden',
                extensions: [{ field: null, message: 'You try to delete someone else\'s comment' }],
            }
        }

        return await this.commentRepository.delete(id);
    }

    async deleteAllByPostId(postId: string): Promise<Result> {
        return await this.commentRepository.deleteAllByPostId(postId);
    }
}