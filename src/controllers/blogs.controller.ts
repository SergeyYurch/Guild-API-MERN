import {Router, Request, Response} from "express";
import {validatorMiddleware} from "../middlewares/validator.middleware";
import {blogsService} from "../services/blogs.service";
import {
    RequestWithBody,
    RequestWithId, RequestWithIdAndBody,
} from "../types/request.type";
import {BlogInputModelDto} from "./dto/blogInputModel.dto";
import {queryRepository} from "../repositories/query.repository";
import {PaginatorOptionInterface} from "../repositories/interfaces/query.repository.interface";
import {parseQueryPaginator} from "../helpers/helpers";
import {postsService} from "../services/posts.service";
import {ObjectId} from "mongodb";
import {authBasicMiddleware} from "../middlewares/authBasic.middleware";

export const blogsRouter = Router();

const {
    validateBlogInputModel,
    validatePostInputModel,
    validateResult
} = validatorMiddleware;
const {createNewBlog, editBlogById, deleteBlogById} = blogsService;
const {createNewPost} = postsService;
const {getAllBlogs, getBlogById, getPostsForBlog} = queryRepository;


blogsRouter.get('/',
    async (req: Request, res: Response) => {
        console.log(`[blogsController]: ${(new Date()).toISOString()} - start GET:/blogs`);
        try {
            const searchNameTerm = req.query.searchNameTerm ? String(req.query.searchNameTerm) : null;
            const paginatorOption: PaginatorOptionInterface = parseQueryPaginator(req);
            return res.status(200).json(await getAllBlogs(searchNameTerm, paginatorOption));
        } catch (error) {
            return res.sendStatus(500);
        }
    });

blogsRouter.post('/',
    authBasicMiddleware,
    validateBlogInputModel(),
    validateResult,
    async (req: RequestWithBody<BlogInputModelDto>, res: Response) => {
        console.log(`[blogsController]:route(POST) /blogs/ - run...`);
        try {
            const {name, websiteUrl, description} = req.body;
            const result = await createNewBlog({name, websiteUrl, description});
            return result ? res.status(201).json(result) : res.sendStatus(500);
        } catch (error) {
            return res.sendStatus(500);
        }
    });

blogsRouter.get('/:id',
    async (req: RequestWithId, res: Response) => {
        console.log(`[blogsController]:route(GET) /blogs/:id - run...`);
        try {
            const id = req.params.id;
            console.log(`[blogsController]: ${(new Date()).toISOString()} - start GET:/${id}`);
            if (!ObjectId.isValid(id)) return res.sendStatus(404);
            const result = await getBlogById(id);
            return result ? res.status(200).json(result) : res.sendStatus(404);
        } catch (error) {
            return res.sendStatus(500);
        }
    });


blogsRouter.get('/:id/posts',
    async (req: RequestWithId, res: Response) => {
        console.log(`[blogsController]:route(GET) /blogs/:id/posts - run...`);
        try {
            const id = req.params.id;
            console.log(`[blogsController]: ${(new Date()).toISOString()} - start GET:/${id}/posts`);
            if (!ObjectId.isValid(id)) return res.sendStatus(404);
            const blogIsExist = await getBlogById(id);
            if (!blogIsExist) return res.sendStatus(404);
            const paginatorOption: PaginatorOptionInterface = parseQueryPaginator(req);
            const result = await getPostsForBlog(id, paginatorOption);
            return res.status(200).json(result);
        } catch (error) {
            return res.sendStatus(500);
        }
    });

blogsRouter.post('/:id/posts',
    authBasicMiddleware,
    validatePostInputModel(),
    validateResult,
    async (req: RequestWithId, res: Response) => {
        console.log(`[blogsController]:route(POST) /blogs/:id/posts - run...`);
        try {
            const {title, shortDescription, content} = req.body;
            const id = req.params.id;
            if (!ObjectId.isValid(id)) return res.sendStatus(404);

            console.log(`[blogsController]: ${(new Date()).toISOString()} - start POST:/${id}/posts`);
            const blogIsExist = await getBlogById(id);
            if (!blogIsExist) return res.sendStatus(404);
            const result = await createNewPost({title, blogId: id, content, shortDescription});
            return res.status(201).json(result);
        } catch (error) {
            return res.sendStatus(500);
        }
    });

blogsRouter.put('/:id',
    authBasicMiddleware,
    validateBlogInputModel(),
    validateResult,
    async (req: RequestWithIdAndBody<BlogInputModelDto>, res: Response) => {
        console.log(`[blogsController]:route(PUT) /blogs/:id - run...`);
        try {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) return res.sendStatus(404);
            const blog = await getBlogById(id);
            if (!blog) return res.sendStatus(404);
            const {name, websiteUrl, description} = req.body;
            const inputBlog: BlogInputModelDto = {name, websiteUrl, description};
            const result = await editBlogById(id, inputBlog);
            return !result ? res.sendStatus(500) : res.sendStatus(204);
        } catch (error) {
            return res.sendStatus(500);
        }
    });

blogsRouter.delete('/:id',
    authBasicMiddleware,
    async (req: RequestWithId, res: Response) => {
        console.log(`[blogsController]:route(DELETE) /blogs/:id - run...`);
        try {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) return res.sendStatus(404);
            const result = await deleteBlogById(id);
            return result ? res.sendStatus(204) : res.sendStatus(404);
        } catch (error) {
            return res.sendStatus(500);
        }
    });
