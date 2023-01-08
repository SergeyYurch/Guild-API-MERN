import {BlogEntity} from "../services/entities/blog.entity";
import {BlogModel, blogsCollection} from "../adapters/dbAdapters";
import {ObjectId, WithId} from "mongodb";
import {BlogEditEntity} from "../services/entities/blog-edit.entity";
import {BlogsRepositoryInterface} from "./interfaces/blogs.repository.interface";

export class BlogsRepository {

    async createNewBlog(inputBlog: BlogEntity): Promise<WithId<BlogEntity> | null> {
        console.log(`[repository]:start createNewBlog`);
        return await BlogModel.create(inputBlog);
    }

    async updateBlogById(id: string, inputBlog: BlogEditEntity): Promise<boolean> {
        console.log(`[repository]:start updateBlogById`);
        const result = await BlogModel.updateOne({_id: new ObjectId(id)}, {$set: inputBlog});
        return result.acknowledged;
    }

    async deleteBlogById(id: string): Promise<boolean> {
        console.log(`[repository]:start deleteBlogById`);
        const result = await BlogModel.deleteOne({_id: new ObjectId(id)});
        return result.acknowledged;
    }
}
