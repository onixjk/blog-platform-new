import {Collection, Db, MongoClient} from 'mongodb';
import {SETTINGS} from '../core/settings/settings';
import {Blog} from "../modules/blog/types/blog";
import {Post} from "../modules/post/types/post";
import {IUserDB} from "../modules/user/types/user.db.interface";
import {Comment} from "../modules/comment/types/comment";
import {RefreshToken} from "../auth/types/refresh-token";

const BLOG_COLLECTION_NAME = 'blogs';
const POST_COLLECTION_NAME = 'posts';
const USER_COLLECTION_NAME = 'users';
const COMMENTS_COLLECTION_NAME = 'comments';
const TOKENS_COLLECTION_NAME = 'tokens';

export let client: MongoClient;
export let blogCollection: Collection<Blog>;
export let postCollection: Collection<Post>;
export let userCollection: Collection<IUserDB>;
export let commentCollection: Collection<Comment>;
export let tokensCollection: Collection<RefreshToken>;

// Подключения к бд
export async function runDB(url: string): Promise<void> {
    client = new MongoClient(url);
    const db: Db = client.db(SETTINGS.DB_NAME);

    //Инициализация коллекций
    blogCollection = db.collection<Blog>(BLOG_COLLECTION_NAME);
    postCollection = db.collection<Post>(POST_COLLECTION_NAME);
    userCollection = db.collection<IUserDB>(USER_COLLECTION_NAME);
    commentCollection = db.collection<Comment>(COMMENTS_COLLECTION_NAME);
    tokensCollection = db.collection<RefreshToken>(TOKENS_COLLECTION_NAME);

    try {
        await client.connect();
        await db.command({ping: 1});
        console.log('✅ Connected to the database');
    } catch (e) {
        await client.close();
        throw new Error(`❌ Database not connected: ${e}`);
    }
}