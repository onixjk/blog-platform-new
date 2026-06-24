import {Collection, Db, MongoClient} from 'mongodb';
import {SETTINGS} from '../core/settings/settings';
import {Blog} from "../modules/blog/types/blog";
import {Post} from "../modules/post/types/post";
import {IUserDB} from "../modules/user/types/user.db.interface";
import {Comment} from "../modules/comment/types/comment";
import {Session} from "../auth/types/session";
import {Device} from "../modules/device/types/device.";

const BLOG_COLLECTION_NAME = 'blogs';
const POST_COLLECTION_NAME = 'posts';
const USER_COLLECTION_NAME = 'users';
const COMMENTS_COLLECTION_NAME = 'comments';
const SESSIONS_COLLECTION_NAME = 'sessions';
const DEVICE_COLLECTION_NAME = 'devices';

export let client: MongoClient;

export let blogCollection: Collection<Blog>;
export let postCollection: Collection<Post>;
export let userCollection: Collection<IUserDB>;
export let commentCollection: Collection<Comment>;
export let sessionCollection: Collection<Session>;
export let deviceCollection: Collection<Device>;

// Подключения к бд
export async function runDB(url: string): Promise<void> {
    client = new MongoClient(url);
    const db: Db = client.db(SETTINGS.DB_NAME);

    //Инициализация коллекций
    blogCollection = db.collection<Blog>(BLOG_COLLECTION_NAME);
    postCollection = db.collection<Post>(POST_COLLECTION_NAME);
    userCollection = db.collection<IUserDB>(USER_COLLECTION_NAME);
    commentCollection = db.collection<Comment>(COMMENTS_COLLECTION_NAME);
    sessionCollection = db.collection<Session>(SESSIONS_COLLECTION_NAME);
    deviceCollection = db.collection<Device>(DEVICE_COLLECTION_NAME);

    try {
        await client.connect();
        await db.command({ping: 1});
        console.log('✅ Connected to the database');

        await sessionCollection.createIndex(
            { expireDate: 1 },
            { expireAfterSeconds: 0 }
        );
        console.log('✅ TTL index for sessionCollection created/verified');
    } catch (e) {
        await client.close();
        throw new Error(`❌ Database not connected: ${e}`);
    }
}