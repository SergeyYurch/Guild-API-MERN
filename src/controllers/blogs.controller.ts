import {Request, Response} from "express";
import {BlogsService} from "../services/blogs.service";
import {
    RequestWithBody,
    RequestWithId, RequestWithIdAndBody,
} from "../types/request.type";
import {BlogInputModelDto} from "./dto/inputModels/blogInputModel.dto";
import {QueryRepository} from "../repositories/query.repository";
import {PaginatorOptionInterface} from "../repositories/interfaces/query.repository.interface";
import {parseQueryPaginator} from "../helpers/helpers";
import {PostsService} from "../services/posts.service";
import {ObjectId} from "mongodb";


export class BlogsController {
    constructor(
        protected blogsService: BlogsService,
        protected queryRepository: QueryRepository,
        protected postsService: PostsService
    ) {
    }

    async getBlogs(req: Request, res: Response) {
        console.log(`[blogsController]: ${(new Date()).toISOString()} - start GET:/blogs`);
        try {
            const searchNameTerm = req.query.searchNameTerm ? String(req.query.searchNameTerm) : null;
            const paginatorOption: PaginatorOptionInterface = parseQueryPaginator(req);
            return res.status(200).json(await this.queryRepository.getAllBlogs(searchNameTerm, paginatorOption));
        } catch (error) {
            return res.sendStatus(500);
        }
    }

    async getBlog(req: RequestWithId, res: Response) {
        console.log(`[blogsController]:route(GET) /blogs/:id - run...`);
        try {
            const id = req.params.id;
            console.log(`[blogsController]: ${(new Date()).toISOString()} - start GET:/${id}`);
            if (!ObjectId.isValid(id)) return res.sendStatus(404);
            const result = await this.queryRepository.getBlogById(id);
            return result ? res.status(200).json(result) : res.sendStatus(404);
        } catch (error) {
            return res.sendStatus(500);
        }
    }

    async createBlog(req: RequestWithBody<BlogInputModelDto>, res: Response) {
        console.log(`[blogsController]:route(POST) /blogs/ - run...`);
        try {
            const {name, websiteUrl, description} = req.body;
            const result = await this.blogsService.createNewBlog({name, websiteUrl, description});
            return result ? res.status(201).json(result) : res.sendStatus(500);
        } catch (error) {
            return res.sendStatus(500);
        }
    }

    async getPostsForBlog(req: RequestWithId, res: Response) {
        console.log(`[blogsController]:route(GET) /blogs/:id/posts - run...`);
        try {
            const id = req.params.id;
            console.log(`[blogsController]: ${(new Date()).toISOString()} - start GET:/${id}/posts`);
            if (!ObjectId.isValid(id)) return res.sendStatus(404);
            const blogIsExist = await this.queryRepository.getBlogById(id);
            if (!blogIsExist) return res.sendStatus(404);
            const paginatorOption: PaginatorOptionInterface = parseQueryPaginator(req);
            const result = await this.queryRepository.getPostsForBlog(id, paginatorOption);
            return res.status(200).json(result);
        } catch (error) {
            return res.sendStatus(500);
        }
    }

    async createPostForBlog(req: RequestWithId, res: Response) {
        console.log(`[blogsController]:route(POST) /blogs/:id/posts - run...`);
        try {
            const {title, shortDescription, content} = req.body;
            const id = req.params.id;
            if (!ObjectId.isValid(id)) return res.sendStatus(404);

            console.log(`[blogsController]: ${(new Date()).toISOString()} - start POST:/${id}/posts`);
            const blogIsExist = await this.queryRepository.getBlogById(id);
            if (!blogIsExist) return res.sendStatus(404);
            const result = await this.postsService.createNewPost({title, blogId: id, content, shortDescription});
            return res.status(201).json(result);
        } catch (error) {
            return res.sendStatus(500);
        }
    }

    async editBlog(req: RequestWithIdAndBody<BlogInputModelDto>, res: Response) {
        console.log(`[blogsController]:route(PUT) /blogs/:id - run...`);
        try {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) return res.sendStatus(404);
            const blog = await this.queryRepository.getBlogById(id);
            if (!blog) return res.sendStatus(404);
            const {name, websiteUrl, description} = req.body;
            const inputBlog: BlogInputModelDto = {name, websiteUrl, description};
            const result = await this.blogsService.editBlogById(id, inputBlog);
            return !result ? res.sendStatus(500) : res.sendStatus(204);
        } catch (error) {
            return res.sendStatus(500);
        }
    }

    async deleteBlog(req: RequestWithId, res: Response) {
        console.log(`[blogsController]:route(DELETE) /blogs/:id - run...`);
        try {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) return res.sendStatus(404);
            const result = await this.blogsService.deleteBlogById(id);
            return result ? res.sendStatus(204) : res.sendStatus(404);
        } catch (error) {
            return res.sendStatus(500);
        }

    }
}
