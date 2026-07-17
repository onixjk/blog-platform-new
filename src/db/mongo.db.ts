// import mongoose from 'mongoose';
// import { Collection, Db, MongoClient } from 'mongodb';
// import { SETTINGS } from '../core/settings/settings';
// import { Blog } from "../modules/blog/types/blog";
// import { Post } from "../modules/post/types/post";
// import { IUserDB } from "../modules/user/types/user.db.interface";
// import { Comment } from "../modules/comment/types/comment";
// import { Session } from "../modules/auth/types/session";
// import { Device } from "../modules/device/types/device.";
// import { ApiRequestLog } from "../modules/auth/types/api-request-log";
//
// const BLOG_COLLECTION_NAME = 'blogs';
// const POST_COLLECTION_NAME = 'posts';
// const USER_COLLECTION_NAME = 'users';
// const COMMENTS_COLLECTION_NAME = 'comments';
// const SESSIONS_COLLECTION_NAME = 'sessions';
// const DEVICE_COLLECTION_NAME = 'devices';
// const API_REQUEST_COLLECTION_NAME = 'apiRequests';
//
// export let client: MongoClient;
//
// export let blogCollection: Collection<Blog>;
// export let postCollection: Collection<Post>;
// export let userCollection: Collection<IUserDB>;
// export let commentCollection: Collection<Comment>;
// export let sessionCollection: Collection<Session>;
// export let deviceCollection: Collection<Device>;
// export let apiRequestsCollection: Collection<ApiRequestLog>;
//
// // Подключения к бд
// export async function runDB(url: string): Promise<void> {
//     // client = new MongoClient(url);
//     // const db: Db = client.db(SETTINGS.DB_NAME);
//
//     //Инициализация коллекций
//     // blogCollection = db.collection<Blog>(BLOG_COLLECTION_NAME);
//     // postCollection = db.collection<Post>(POST_COLLECTION_NAME);
//     // userCollection = db.collection<IUserDB>(USER_COLLECTION_NAME);
//     // commentCollection = db.collection<Comment>(COMMENTS_COLLECTION_NAME);
//     // sessionCollection = db.collection<Session>(SESSIONS_COLLECTION_NAME);
//     // deviceCollection = db.collection<Device>(DEVICE_COLLECTION_NAME);
//     // apiRequestsCollection = db.collection<ApiRequestLog>(API_REQUEST_COLLECTION_NAME);
//
//     try {
//         await mongoose.connect(url);
//         // await db.command({ ping: 1 });
//         console.log('✅ Connected to the database');
//
//         // await apiRequestsCollection.createIndex({ date: 1 }, { expireAfterSeconds: 10 });
//         // await sessionCollection.createIndex({ expireDate: 1 }, { expireAfterSeconds: 0 });
//         // console.log('✅ TTL index for sessionCollection created/verified');
//     } catch (e) {
//         // await client.close();
//         await mongoose.disconnect()
//         throw new Error(`❌ Database not connected: ${ e }`);
//     }
//
//     // try {
//     //     await client.connect();
//     //     await db.command({ ping: 1 });
//     //     console.log('✅ Connected to the database');
//     //
//     //     await apiRequestsCollection.createIndex({ date: 1 }, { expireAfterSeconds: 10 });
//     //     await sessionCollection.createIndex({ expireDate: 1 }, { expireAfterSeconds: 0 });
//     //     console.log('✅ TTL index for sessionCollection created/verified');
//     // } catch (e) {
//     //     await client.close();
//     //     throw new Error(`❌ Database not connected: ${ e }`);
//     // }
// }

import mongoose, { Schema } from 'mongoose';
import { SETTINGS } from '../core/settings/settings';
import { Blog } from "../modules/blog/types/blog";
import { Post } from "../modules/post/types/post";
import { IUserDB } from "../modules/user/types/user.db.interface";
import { Comment } from "../modules/comment/types/comment";
import { Session } from "../modules/auth/types/session";
import { ApiRequestLog } from "../modules/auth/types/api-request-log";

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

export let BlogModel = mongoose.model<Blog>('blogs', BlogSchema);
export let PostModel = mongoose.model<Post>('posts', PostSchema);
export let UserModel = mongoose.model<IUserDB>('users', UserSchema);
export let CommentModel = mongoose.model<Comment>('comments', CommentSchema);
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
