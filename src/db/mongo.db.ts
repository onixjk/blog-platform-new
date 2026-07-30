import mongoose, { Schema } from 'mongoose';
import { SETTINGS } from '../core/settings/settings';
import { Blog } from "../modules/blog/types/blog";
import { Post } from "../modules/post/types/post";
import { IUserDB } from "../modules/user/types/user.db.interface";
import { Comment } from "../modules/comment/types/comment";
import { Session } from "../modules/auth/types/session";
import { ApiRequestLog } from "../modules/auth/types/api-request-log";
import { LikeComments } from "../modules/like/types/like-comments";

const ApiRequestSchema = new Schema<ApiRequestLog>({
    ip: { type: String, required: true },
    url: { type: String, required: true },
    date: { type: Date, required: true, expires: 10 }
});

export const SessionSchema = new Schema<Session>({
    user_id: { type: String, required: true },
    device_id: { type: String, required: true },
    iat: { type: Date, required: true },
    browserName: { type: String, required: true },
    ip: { type: String, required: true },
    exp: { type: Date, required: true, expires: 0 }
});

export const BlogSchema = new Schema<Blog>({
    name: { type: String, required: true, minLength: 1 },
    description: { type: String, required: true, minLength: 1 },
    websiteUrl: { type: String, required: true, minLength: 7 },
    createdAt: { type: String, required: true },
    isMembership: { type: Boolean, required: true, default: false },
});

export const PostSchema = new Schema<Post>({
    title: { type: String, required: true, minLength: 1 },
    shortDescription: { type: String, required: true, minLength: 1 },
    content: { type: String, required: true, minLength: 1 },
    blogId: { type: String, required: true },
    blogName: { type: String, required: true, minLength: 1 },
    createdAt: { type: String, required: true },
    extendedLikesInfo: {
        likesCount: { type: Number, required: true, default: 0 },
        dislikesCount: { type: Number, required: true, default: 0 }
    }
});

export const CommentSchema = new Schema<Comment>({
    postId: { type: String, required: true },
    content: { type: String, required: true, minLength: 1, },
    commentatorInfo: {
        userId: { type: String, required: true },
        userLogin: { type: String, required: true, minLength: 1, },
    },
    createdAt: { type: String, required: true },
    likesInfo: {
        likesCount: { type: Number, required: true, default: 0 },
        dislikesCount: { type: Number, required: true, default: 0 }
    }
});

export const UserSchema = new Schema<IUserDB>({
    login: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: String, required: true },
    emailConfirmation: {
        confirmationCode: { type: String },
        expirationDate: { type: Date },
        isConfirmed: { type: Boolean, default: false }
    },
    passwordRecovery: {
        recoveryCode: { type: String },
        expirationDate: { type: Date },
    },
});

export const CommentLikeSchema = new Schema<LikeComments>({
    commentId: { type: String, required: true },
    userId: { type: String, required: true },
    status: { type: String, required: true },
    createdAt: { type: String, required: true }
});

export const PostLikeSchema = new Schema<LikeComments>({
    commentId: { type: String, required: true },
    userId: { type: String, required: true },
    status: { type: String, required: true },
    createdAt: { type: String, required: true }
});

export let BlogModel = mongoose.model<Blog>('blogs', BlogSchema);
export let PostModel = mongoose.model<Post>('posts', PostSchema);
export let UserModel = mongoose.model<IUserDB>('users', UserSchema);
export let CommentModel = mongoose.model<Comment>('comments', CommentSchema);
export let CommentLikeModel = mongoose.model<LikeComments>('commentLike', CommentLikeSchema);
export let PostLikeModel = mongoose.model<LikeComments>('postLike', PostLikeSchema);
export let SessionModel = mongoose.model<Session>('sessions', SessionSchema);
export let ApiRequestsModel = mongoose.model<ApiRequestLog>('apiRequests', ApiRequestSchema);

export async function runDB(url: string): Promise<void> {
    try {
        await mongoose.connect(url, {
            dbName: SETTINGS.DB_NAME
        });
        console.log('✅ Connected to the database via Mongoose');
    } catch (e) {
        await mongoose.disconnect();
        throw new Error(`❌ Database not connected: ${ e }`);
    }
}
