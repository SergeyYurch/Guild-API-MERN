import * as dotenv from "dotenv";
import mongoose from 'mongoose';
import { userSchema} from '../repositories/schemes/user.schema';
import {blogSchema} from '../repositories/schemes/blog.schema';
import {postSchema} from '../repositories/schemes/post.schema';
import {commentSchema} from '../repositories/schemes/comment.schema';
import {sessionSchema} from '../repositories/schemes/session.schema';
import {accessAttemptSchema} from '../repositories/schemes/access-attempt.schema';
import {likeSchema} from '../repositories/schemes/like.schema';

dotenv.config();

const mongoUri = process.env.MONGO_URI
const dbName = process.env.DB_NAME
if (!mongoUri || !dbName){
    throw new Error('!!!Mongo URI does not found')
}

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
        console.log("Mongo server connected successfully");
    } catch {
        console.log("Can't connect to DB");
        await mongoose.disconnect();
    }
}