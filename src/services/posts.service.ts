import {PostViewModelDto} from "../controllers/dto/postViewModel.dto";
import {PostInputModelDto} from "../controllers/dto/postInputModel.dto";
import {PostEntity} from "./entities/post.entity";
import {PostEditEntity} from "./entities/postEdit.entity";
import {QueryRepository} from "../repositories/query.repository";
import {PostsRepository} from "../repositories/posts.repository";


export class PostsService {
    private postsRepository: PostsRepository;
    private queryRepository: QueryRepository;

    constructor() {
        this.postsRepository = new PostsRepository();
        this.queryRepository = new QueryRepository();
    }

    async createNewPost(post: PostInputModelDto): Promise<PostViewModelDto | null> {
        const {title, shortDescription, content, blogId} = post;
        const blogName = (await this.queryRepository.getBlogById(blogId))?.name;
        if (!blogName) return null;
        const createdAt = new Date().toISOString();
        const newPost: PostEntity = {
            title, shortDescription, content, blogId, blogName, createdAt
        };
        const postInDb = await this.postsRepository.createNewPost(newPost);
        if (!postInDb) return null;
        return {
            id: postInDb._id.toString(),
            title: postInDb.title,
            shortDescription: postInDb.shortDescription,
            content: postInDb.content,
            blogId: postInDb.blogId,
            blogName: postInDb.blogName,
            createdAt: postInDb.createdAt
        };
    }

    async editPostById(id: string, post: PostInputModelDto): Promise<boolean> {
        const {title, shortDescription, content, blogId} = post;
        const blogName = (await this.queryRepository.getBlogById(blogId))?.name;
        if (!blogName) return false;
        const postToDb: PostEditEntity = {
            title,
            blogId,
            content,
            shortDescription,
            blogName
        };
        return await this.postsRepository.updatePostById(id, postToDb);
    }

    async deletePostById(id: string): Promise<boolean> {
        return this.postsRepository.deletePostById(id);
    }
}