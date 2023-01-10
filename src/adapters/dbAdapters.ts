import {MongoClient} from 'mongodb';
import {BlogEntity} from "../services/entities/blog.entity";
import {PostEntity} from "../services/entities/post.entity";
import {UserEntity} from "../services/entities/user.entity";
import {CommentEntity} from "../services/entities/comment.entity";
import * as dotenv from "dotenv";
import {RefreshTokenEntity} from "../services/entities/refresh-token.entity";
import {AccessAttemptInDb} from "../repositories/repository-interfaces/access-attempt-in-db.interface";
import {DbAuthSessionInterface} from '../repositories/repository-interfaces/db-auth-session.interface';
import mongoose from 'mongoose';
import { userSchema} from '../repositories/schemas/user.schema';
import {blogSchema} from '../repositories/schemas/blog.schema';
import {postSchema} from '../repositories/schemas/post.schema';
import {commentSchema} from '../repositories/schemas/comment.schema';
import {sessionSchema} from '../repositories/schemas/session.schema';
import {accessAttemptSchema} from '../repositories/schemas/access-attempt.schema';
import {likeSchema} from '../repositories/schemas/like.schema';

dotenv.config();

const mongoUri = process.env.MONGO_URI
const dbName = process.env.DB_NAME
if (!mongoUri || !dbName){
    throw new Error('!!!Mongo URI does not found')
}
const client = new MongoClient(mongoUri+"/"+dbName+"?retryWrites=true&w=majority") //+"?retryWrites=true&w=majority"
const dbAdapters = client.db();
export const blogsCollection = dbAdapters.collection<BlogEntity>('blogs')
export const postsCollection = dbAdapters.collection<PostEntity>('posts')
export const usersCollection = dbAdapters.collection<UserEntity>('users')
export const commentsCollection = dbAdapters.collection<CommentEntity>('comments')
export const tokensBlackListCollection = dbAdapters.collection<RefreshTokenEntity>('tokens_black_list')
export const deviceAuthSessionsCollection = dbAdapters.collection<DbAuthSessionInterface>('device_auth_sessions')
export const accessAttemptCollection = dbAdapters.collection<AccessAttemptInDb>('access_attempt')


//Mongoose Models
export const BlogModel = mongoose.model('Blog', blogSchema)
export const PostModel = mongoose.model('Post', postSchema)
export const UserModel = mongoose.model('User', userSchema)
export const CommentModel = mongoose.model('Comment', commentSchema)
export const SessionModel = mongoose.model('Session', sessionSchema)
export const AccessAttemptModel = mongoose.model('AccessAttempt', accessAttemptSchema)
export const LikeModel = mongoose.model('Like', likeSchema)






export async function runDB() {
    try{
        await mongoose.connect(mongoUri + '/' + dbName+'?retryWrites=true&w=majority');
        await client.connect();
        await client.db('guildDB').command({ping: 1})
        console.log("Mongo server connected successfully");
    } catch {
        console.log("Can't connect to DB");
        // await client.close()
        await mongoose.disconnect();

    }
}