import { PostInputDto } from "../types/input/post.input-dto";
import { Post } from "../types/post";
import { Result } from "../../../core/result/result.type";
import { inject, injectable } from "inversify";
import { PostRepository } from "../repositories/post.repository";
import { CommentRepository } from "../../comment/repositories/comment.repository";
import { ResultStatus } from "../../../core/result/resultCode";
import { PostModel } from "../../../db/mongo.db";
import { HydratedDocument } from "mongoose";
import { BlogRepository } from "../../blog/repositories/blogRepository";
import { LikeStatus } from "../../like/types/like-status";
import { PostLikeStatusInputDto } from "../../like/types/input/post-like-status-input.dto";
import { PostLikeRepository } from "../../like/repositories/post-like.repository";
import { UserRepository } from "../../user/repositories/user.repository";

@injectable()
export class PostService {

    constructor(
        @inject(PostRepository) private postRepository: PostRepository,
        @inject(CommentRepository) private commentRepository: CommentRepository,
        @inject(PostLikeRepository) private postLikeRepository: PostLikeRepository,
        @inject(UserRepository) private userRepository: UserRepository,
        @inject(BlogRepository) private blogRepository: BlogRepository,
    ) {}

    async findById(id: string): Promise<Result<HydratedDocument<Post> | null>> {

        const post = await this.postRepository.findById(id);
        if (!post) {
            return {
                status: ResultStatus.NotFound_404,
                errorMessage: 'NotFound',
                data: null,
                extensions: [{ field: 'Post', message: 'Post not exist' }]
            };
        }

        return {
            status: ResultStatus.Success,
            data: post,
            extensions: []
        };
    }

    async create(dto: PostInputDto): Promise<Result<string | null>> {

        const blog = await this.blogRepository.findById(dto.blogId);
        if (!blog) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: 'Blog', message: 'Blog not exist' }]
            };
        }

        const newPost = new PostModel({
            title: dto.title,
            shortDescription: dto.shortDescription,
            content: dto.content,
            blogId: dto.blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString(),
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0
            }
        })

        const savedPostId = await this.postRepository.save(newPost);

        return {
            status: ResultStatus.Success,
            data: savedPostId,
            extensions: []
        };
    }

    async update(id: string, dto: PostInputDto): Promise<Result<string | null>> {

        const blog = await this.blogRepository.findById(dto.blogId);
        if (!blog) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: 'blogId', message: 'Blog not exist' }]
            };
        }

        const post = await this.postRepository.findById(id);
        if (!post) {
            return {
                status: ResultStatus.NotFound_404,
                errorMessage: 'NotFound',
                data: null,
                extensions: [{ field: 'Post', message: 'Post not exist' }]
            };
        }

        post.set({
            title: dto.title,
            shortDescription: dto.shortDescription,
            content: dto.content,
            blogId: dto.blogId,
            blogName: blog.name,
        })

        const savedPostId = await this.postRepository.save(post);

        return {
            status: ResultStatus.Success,
            data: savedPostId,
            extensions: []
        };
    }

    async updateLikeCountAndStatus(dto: PostLikeStatusInputDto): Promise<Result> {

        const post = await this.postRepository.findById(dto.postId);
        if (!post) return {
            status: ResultStatus.NotFound_404,
            errorMessage: 'NotFound',
            data: null,
            extensions: [{ field: 'Post', message: 'Post does not exist' }],
        }

        const user = await this.userRepository.findById(dto.userId);
        if (!user) return {
            status: ResultStatus.Unauthorized_401,
            data: null,
            extensions: []
        };

        const like = await this.postLikeRepository.findByPostIdAndUserId(dto.postId, dto.userId);

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

        // 1. Обновляем статус самого лайка через репозиторий лайков
        await this.postLikeRepository.updateLikeStatus(dto.postId, dto.userId, newStatus, user.login);

        // 2. Обновляем счетчики лайков через репозиторий постов
        await this.postRepository.updateLikesCount(dto.postId, likesModifier, dislikesModifier);

        // 3. Синхронизируем массив кэшированных топ-3 лайков в посте через репозитории
        if (newStatus === LikeStatus.Like) {
            await this.postRepository.pushNewestLike(dto.postId, dto.userId, user.login);
        } else {
            // Удаляем пользователя из кэша
            await this.postRepository.pullNewestLike(dto.postId, dto.userId);

            // Добираем из базы актуальный топ-3, если массив опустел
            const activeTopLikes = await this.postLikeRepository.getLatestLikesForPost(dto.postId);

            const formattedLikes = activeTopLikes.map(l => ({
                addedAt: l.createdAt,
                userId: l.userId,
                login: l.login
            }));

            await this.postRepository.setNewestLikes(dto.postId, formattedLikes);
        }

        return {
            status: ResultStatus.Success,
            data: null,
            extensions: []
        };
    }

    async delete(id: string): Promise<Result<boolean | null>> {

        const isDeleted = await this.postRepository.delete(id);
        if (!isDeleted) {
            return {
                status: ResultStatus.NotFound_404,
                errorMessage: 'Not Found',
                data: null,
                extensions: [{ field: 'Post', message: 'Post not exist' }]
            };
        }

        await this.commentRepository.deleteAllByPostId(id)

        return {
            status: ResultStatus.Success,
            data: isDeleted,
            extensions: []
        };
    }
}