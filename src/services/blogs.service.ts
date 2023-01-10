import {BlogViewModelDto} from "../controllers/dto/viewModels/blogViewModel.dto";
import {BlogInputModelDto} from "../controllers/dto/inputModels/blogInputModel.dto";
import {BlogEntity} from "./entities/blog.entity";
import {BlogEditEntity} from "./entities/blog-edit.entity";
import {QueryRepository} from "../repositories/query.repository";
import {BlogsRepository} from "../repositories/blogs.repository";


export class BlogsService {
    private blogsRepository: BlogsRepository;
    private queryRepository: QueryRepository;

    constructor() {
        this.blogsRepository = new BlogsRepository();
        this.queryRepository = new QueryRepository();
    }

    async createNewBlog(blog: BlogInputModelDto): Promise<BlogViewModelDto | null> {
        const {name, websiteUrl, description} = blog;
        const createdAt = new Date().toISOString();
        const newBlog: BlogEntity = {
            name, websiteUrl, description, createdAt
        };
        const blogInDb = await this.blogsRepository.createNewBlog(newBlog);
        if (!blogInDb) return null;
        return {
            id: blogInDb._id.toString(),
            name: blogInDb.name,
            description: blogInDb.description,
            websiteUrl: blogInDb.websiteUrl,
            createdAt: blogInDb.createdAt
        };
    }

    async editBlogById(id: string, blog: BlogInputModelDto): Promise<boolean> {
        const {name, websiteUrl, description} = blog;
        const blogToDb: BlogEditEntity = {
            name,
            websiteUrl,
            description,
        };
        return await this.blogsRepository.updateBlogById(id, blogToDb);
    }

    async deleteBlogById(id: string): Promise<boolean> {
        const blog = await this.queryRepository.getBlogById(id);
        if (!blog) return false;
        return await this.blogsRepository.deleteBlogById(id);
    }
}