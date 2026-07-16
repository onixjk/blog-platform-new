import { CommentCreateDto } from "../types/input/comment-create.dto";
import { Comment } from "../types/comment";
import { CommentRepository } from "../repositories/comment.repository";
import { CommentUpdateDto } from "../types/input/comment-update.dto";
import { Result } from "../../../core/result/result.type";
import { ResultStatus } from "../../../core/result/resultCode";
import { inject, injectable } from "inversify";
import { PostRepository } from "../../post/repositories/post.repository";
import { CommentModel } from "../../../db/mongo.db";
import { HydratedDocument } from "mongoose";
import { UserRepository } from "../../user/repositories/user.repository";

@injectable()
export class CommentService {

    constructor(
        @inject(CommentRepository) private commentRepository: CommentRepository,
        @inject(UserRepository) private userRepository: UserRepository,
        @inject(PostRepository) private postRepository: PostRepository,
    ) {}

    async findById(id: string): Promise<Result<HydratedDocument<Comment> | null>> {
        const comment = await this.commentRepository.findById(id);
        if (!comment) {
            return {
                status: ResultStatus.NotFound_404,
                errorMessage: 'NotFound',
                data: null,
                extensions: [{ field: 'Comment', message: 'Comment not exist' }]
            };
        }

        return {
            status: ResultStatus.Success,
            data: comment,
            extensions: []
        };
    }

    async create(dto: CommentCreateDto): Promise<Result<string | null>> {

        const post = await this.postRepository.findById(dto.postId);
        if (!post) {
            return {
                status: ResultStatus.NotFound_404,
                errorMessage: 'NotFound',
                data: null,
                extensions: [{ field: 'Post', message: 'Post not exist' }],
            }
        }

        const user = await this.userRepository.findById(dto.userId);
        if (!user) {
            return {
                status: ResultStatus.NotFound_404,
                errorMessage: 'NotFound',
                data: null,
                extensions: [{ field: 'User', message: 'User not exist' }],
            }
        }

        const newComment = new CommentModel({
            postId: dto.postId,
            content: dto.content,
            commentatorInfo: {
                userId: dto.userId,
                userLogin: user.login
            },
            createdAt: new Date().toISOString(),
        });

        const savedCommentId = await this.commentRepository.save(newComment);

        return {
            status: ResultStatus.Success,
            data: savedCommentId,
            extensions: []
        };
    }

    async update(dto: CommentUpdateDto): Promise<Result<string | null>> {

        const comment = await this.commentRepository.findById(dto.commentId);
        if (!comment) {
            return {
                status: ResultStatus.NotFound_404,
                errorMessage: 'NotFound',
                data: null,
                extensions: [{ field: 'Comment', message: 'Comment not exist' }],
            }
        }

        if (comment.commentatorInfo.userId !== dto.userId) {
            return {
                status: ResultStatus.Forbidden_403,
                errorMessage: 'Forbidden',
                data: null,
                extensions: [{ field: 'Comment', message: 'You try to update someone else\'s comment' }],
            }
        }

        comment.content = dto.content;

        const savedCommentId = await this.commentRepository.save(comment);

        return {
            status: ResultStatus.Success,
            data: savedCommentId,
            extensions: []
        };
    }

    async delete(id: string, userId: string): Promise<Result<boolean | null>> {

        const comment = await this.commentRepository.findById(id);
        if (!comment) {
            return {
                status: ResultStatus.NotFound_404,
                data: null,
                errorMessage: 'Not Found',
                extensions: [{ field: null, message: 'Comment doesn\'t exist' }],
            };
        }

        if (comment.commentatorInfo.userId !== userId) {
            return {
                status: ResultStatus.Forbidden_403,
                data: null,
                errorMessage: 'Forbidden',
                extensions: [{ field: null, message: 'You try to delete someone else\'s comment' }],
            }
        }

        const isDeleted = await this.commentRepository.delete(id);

        return {
            status: ResultStatus.Success,
            data: isDeleted,
            extensions: []
        };
    }

    // async deleteAllByPostId(postId: string): Promise<Result<boolean | null>> {
    //
    //     const isAllDeleted = await this.commentRepository.deleteAllByPostId(postId);
    //
    //     return {
    //         status: ResultStatus.Success,
    //         data: isAllDeleted,
    //         extensions: []
    //     };
    // }
}