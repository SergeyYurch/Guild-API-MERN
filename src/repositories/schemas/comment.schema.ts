import {Schema} from 'mongoose';
import {CommentEntity} from '../../services/entities/comment.entity';

export const commentSchema = new Schema<CommentEntity>( {
    content: String,
    postId:String,
    userId: String,
    userLogin: String,
    createdAt: String,
})