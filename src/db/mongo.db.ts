import mongoose, { Schema } from 'mongoose';
import { SETTINGS } from '../core/settings/settings';
import { Blog } from "../modules/blog/types/blog";
import { Post } from "../modules/post/types/post";
import { IUserDB } from "../modules/user/types/user.db.interface";
import { Comment } from "../modules/comment/types/comment";
import { Session } from "../modules/auth/types/session";
import { ApiRequestLog } from "../modules/auth/types/api-request-log";
import { Like } from "../modules/like/types/like";

const ApiRequestSchema = new Schema<ApiRequestLog>({
    date: { type: Date, required: true, expires: 10 }
}, { strict: false });

const SessionSchema = new Schema<Session>({
    exp: { type: Date, required: true, expires: 0 }
}, { strict: false });

const BlogSchema = new Schema<Blog>({}, { strict: false });
const PostSchema = new Schema<Post>({}, { strict: false });
const UserSchema = new Schema<IUserDB>({}, { strict: false });
const CommentSchema = new Schema<Comment>({}, { strict: false });
const LikesSchema = new Schema<Like>({}, { strict: false });
// export const LikesSchema = new Schema<Like>({
//     commentId: { type: String, required: true },
//     userId: { type: String, required: true },
//     status: { type: String, required: true },
//     createdAt: { type: String, required: true }
// });

export let BlogModel = mongoose.model<Blog>('blogs', BlogSchema);
export let PostModel = mongoose.model<Post>('posts', PostSchema);
export let UserModel = mongoose.model<IUserDB>('users', UserSchema);
export let CommentModel = mongoose.model<Comment>('comments', CommentSchema);
export let LikeModel = mongoose.model<Like>('likes', LikesSchema);
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
