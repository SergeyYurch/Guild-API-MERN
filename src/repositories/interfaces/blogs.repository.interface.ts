import {BlogEntity} from "../../services/entities/blog.entity";
import {BlogEditEntity} from "../../services/entities/blog-edit.entity";
import {WithId} from "mongodb";

export interface BlogsRepositoryInterface {
    createNewBlog: (inputBlog: BlogEntity) => Promise<WithId<BlogEntity> | null>;
    updateBlogById: (id: string, inputBlog: BlogEditEntity) => Promise<boolean>;
    deleteBlogById: (id: string) => Promise<boolean>;
}