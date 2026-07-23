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
import { LikeStatus } from "../../like/types/like-status";
import { LikeStatusInputDto } from "../../like/types/input/like-status-input.dto";
import { LikeService } from "../../like/application/like.service";
import { LikeRepository } from "../../like/repositories/like.repository";

@injectable()
export class CommentService {

    constructor(
        @inject(CommentRepository) private commentRepository: CommentRepository,
        @inject(UserRepository) private userRepository: UserRepository,
        @inject(PostRepository) private postRepository: PostRepository,
        @inject(LikeRepository) private likeRepository: LikeRepository,
        @inject(LikeService) private likeService: LikeService,
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
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LikeStatus.None,
            }
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

        comment.set({
            content: dto.content,
        });

        const savedCommentId = await this.commentRepository.save(comment);

        return {
            status: ResultStatus.Success,
            data: savedCommentId,
            extensions: []
        };
    }

    async updateLikeCountAndStatus(dto: LikeStatusInputDto): Promise<Result> {

        const comment = await this.commentRepository.findById(dto.commentId);
        if (!comment) {
            return {
                status: ResultStatus.NotFound_404,
                errorMessage: 'NotFound',
                data: null,
                extensions: [{ field: 'Comment', message: 'Comment not exist' }],
            }
        }

        const like = await this.likeRepository.findByCommentIdAndUserId(dto.commentId, dto.userId);

        const oldStatus = like ? like.status : LikeStatus.None;
        const newStatus = dto.likeStatus;

        if (oldStatus === newStatus) {
            return {
                status: ResultStatus.Success,
                data: null,
                extensions: []
            };
        }

        let likesModifier = 0;
        let dislikesModifier = 0;

        if (oldStatus === LikeStatus.Like) likesModifier--;
        if (oldStatus === LikeStatus.Dislike) dislikesModifier--;

        if (newStatus === LikeStatus.Like) likesModifier++;
        if (newStatus === LikeStatus.Dislike) dislikesModifier++;

        await this.likeService.update({
            commentId: dto.commentId,
            userId: dto.userId,
            status: newStatus,
            createdAt: new Date().toISOString(),
        });

        await this.commentRepository.updateLikesCount(dto.commentId, likesModifier, dislikesModifier);

        return {
            status: ResultStatus.Success,
            data: null,
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
}