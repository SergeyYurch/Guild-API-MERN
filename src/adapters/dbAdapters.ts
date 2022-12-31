import {MongoClient} from 'mongodb';
import {BlogEntity} from "../services/entities/blog.entity";
import {PostEntity} from "../services/entities/post.entity";
import {UserEntity} from "../services/entities/user.entity";
import {CommentEntity} from "../services/entities/comment.entity";
import * as dotenv from "dotenv";
import {RefreshTokenEntity} from "../services/entities/refresh-token.entity";
import {AccessAttemptInDb} from "../repositories/entitiesRepository/access-attempt-in-db.interface";
import {DbAuthSessionInterface} from '../repositories/entitiesRepository/db-auth-session.interface';
dotenv.config();

const mongoUri = process.env.MONGO_URI
if (!mongoUri){
    throw new Error('!!!Mongo URI does not found')
}
const client = new MongoClient(mongoUri)
const dbAdapters = client.db();
export const blogsCollection = dbAdapters.collection<BlogEntity>('blogs')
export const postsCollection = dbAdapters.collection<PostEntity>('posts')
export const usersCollection = dbAdapters.collection<UserEntity>('users')
export const commentsCollection = dbAdapters.collection<CommentEntity>('comments')
export const tokensBlackListCollection = dbAdapters.collection<RefreshTokenEntity>('tokens_black_list')
export const deviceAuthSessionsCollection = dbAdapters.collection<DbAuthSessionInterface>('device_auth_sessions')
export const accessAttemptCollection = dbAdapters.collection<AccessAttemptInDb>('access_attempt')

export async function runDB() {
    try{
        await client.connect();
        await client.db('guildDB').command({ping: 1})
        console.log("Mongo server connected successfully");
    } catch {
        console.log("Can't connect to DB");
        await client.close()
    }
}