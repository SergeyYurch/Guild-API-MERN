import mongoose, {Model, Schema} from 'mongoose';
import {BlogEntity} from '../../services/entities/blog.entity';

export type BlogModelType = Model<BlogEntity, {}, BlogMethodsInterface>;

export interface BlogMethodsInterface {
    createNewBlog: () => Promise<string | null>;
}

export const blogSchema = new Schema<BlogEntity, BlogModelType, BlogMethodsInterface>({
    name: String,
    description: String,
    websiteUrl: String,
    createdAt: String
});

blogSchema.method('createNewBlog', function createNewBlog() {
    return 'createNewBlog';
});


export const BlogModel = mongoose.model<BlogEntity, BlogModelType>('Blog', blogSchema);
