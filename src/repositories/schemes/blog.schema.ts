import {Schema} from 'mongoose';
import {BlogEntity} from '../../services/entities/blog.entity';

export const blogSchema = new Schema<BlogEntity>({
    name: String,
    description: String,
    websiteUrl: String,
    createdAt: String
});