import {BlogViewModelDto} from "../controllers/dto/blogViewModel.dto";
import {BlogsServiceInterface} from "./interfaces/blogs.service.interface";
import {BlogInputModelDto} from "../controllers/dto/blogInputModel.dto";
import {BlogEntity} from "./entities/blog.entity";
import {BlogEditEntity} from "./entities/blog-edit.entity";
import {queryRepository} from "../repositories/query.repository";
import {blogsRepository} from "../repositories/blogs.repository";

const {
    createNewBlog,
    updateBlogById,
    deleteBlogById
} = blogsRepository;

const { getBlogById} = queryRepository
export const blogsService:BlogsServiceInterface = {


    createNewBlog: async (blog: BlogInputModelDto): Promise<BlogViewModelDto | null> => {
        const {name, websiteUrl, description} = blog;
        const createdAt = new Date().toISOString();
        const newBlog: BlogEntity = {
            name, websiteUrl, description, createdAt
        };
        const blogInDb = await createNewBlog(newBlog);
        if (!blogInDb) return null;
        return {
            id: blogInDb._id.toString(),
            name: blogInDb.name,
            description: blogInDb.description,
            websiteUrl: blogInDb.websiteUrl,
            createdAt: blogInDb.createdAt
        };
    },



    editBlogById: async (id: string, blog: BlogInputModelDto): Promise<boolean> => {
        const {name, websiteUrl, description} = blog;
        const blogToDb: BlogEditEntity = {
            name,
            websiteUrl,
            description,
        };
        return await updateBlogById(id, blogToDb);
    },

    deleteBlogById: async (id: string): Promise<boolean> => {
        const blog = await getBlogById(id);
        if (!blog) return false;
        return await deleteBlogById(id);
    },
};