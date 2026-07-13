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
import { SETTINGS } from '../core/settings/settings'; // Проверьте путь до settings
import { Blog } from "../modules/blog/types/blog";
import { Post } from "../modules/post/types/post";
import { IUserDB } from "../modules/user/types/user.db.interface";
import { Comment } from "../modules/comment/types/comment";
import { Session } from "../modules/auth/types/session";
import { Device } from "../modules/device/types/device.";
import { ApiRequestLog } from "../modules/auth/types/api-request-log";

// 1. Создаем схемы. Настройки TTL-индексов (expires) переехали сюда
const ApiRequestSchema = new Schema<ApiRequestLog>({
    date: { type: Date, required: true, expires: 10 } // TTL-индекс на 10 секунд
}, { strict: false });

const SessionSchema = new Schema<Session>({
    exp: { type: Date, required: true, expires: 0 } // TTL-индекс по времени жизни сессии
}, { strict: false });

// Для остальных коллекций делаем пустые схемы, чтобы Mongoose не резал "лишние" поля
const BlogSchema = new Schema<Blog>({}, { strict: false });
const PostSchema = new Schema<Post>({}, { strict: false });
const UserSchema = new Schema<IUserDB>({}, { strict: false });
const CommentSchema = new Schema<Comment>({}, { strict: false });
const DeviceSchema = new Schema<Device>({}, { strict: false });

// 2. Экспортируем старые переменные коллекций (как тип any, чтобы старый код репозиториев не ругался)
export let blogCollection: any;
export let postCollection: any;
export let userCollection: any;
export let commentCollection: any;
export let sessionCollection: any;
export let deviceCollection: any;
export let apiRequestsCollection: any;

// 3. Функция подключения, которую вы вызываете в bootstrap
export async function runDB(url: string): Promise<void> {
    try {
        // Подключаемся к MongoDB Атласу и явно передаем имя базы из SETTINGS
        await mongoose.connect(url, {
            dbName: SETTINGS.DB_NAME
        });

        console.log('✅ Connected to the database via Mongoose');

        // Связываем старые переменные коллекций с созданными моделями Mongoose
        blogCollection = mongoose.model<Blog>('blogs', BlogSchema);
        postCollection = mongoose.model<Post>('posts', PostSchema);
        userCollection = mongoose.model<IUserDB>('users', UserSchema);
        commentCollection = mongoose.model<Comment>('comments', CommentSchema);
        sessionCollection = mongoose.model<Session>('sessions', SessionSchema);
        deviceCollection = mongoose.model<Device>('devices', DeviceSchema);
        apiRequestsCollection = mongoose.model<ApiRequestLog>('apiRequests', ApiRequestSchema);

    } catch (e) {
        await mongoose.disconnect();
        throw new Error(`❌ Database not connected: ${e}`);
    }
}
