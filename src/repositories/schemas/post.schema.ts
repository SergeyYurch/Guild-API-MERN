import {Schema} from 'mongoose';
import {PostEntity} from '../../services/entities/post.entity';

export const  postSchema = new Schema<PostEntity> (  {
    title:String,
    shortDescription:String,
    content: String,
    blogId:String,
    blogName:String,
    createdAt: String,
})