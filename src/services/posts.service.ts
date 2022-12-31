import {PostViewModelDto} from "../controllers/dto/postViewModel.dto";
import {PostInputModelDto} from "../controllers/dto/postInputModel.dto";
import {PostEntity} from "./entities/post.entity";
import {PostsServiceInterface} from "./interfaces/posts.service.interface";
import {PostEditEntity} from "./entities/postEdit.entity";
import {queryRepository} from "../repositories/query.repository";
import {postsRepository} from "../repositories/posts.repository";

const {
    createNewPost,
    updatePostById,
    deletePostById,
} = postsRepository;

const {getBlogById} = queryRepository

export const postsService:PostsServiceInterface = {

    createNewPost: async (post: PostInputModelDto): Promise<PostViewModelDto | null> => {
        const {title, shortDescription, content, blogId} = post;
        const blogName = (await getBlogById(blogId))?.name
        if (!blogName) return null ;
        const createdAt = new Date().toISOString();
        const newPost: PostEntity = {
            title, shortDescription, content, blogId, blogName, createdAt
        };
        const postInDb = await createNewPost(newPost);
        if(!postInDb) return null
        return {
            id: postInDb._id.toString(),
            title: postInDb.title,
            shortDescription: postInDb.shortDescription,
            content: postInDb.content,
            blogId: postInDb.blogId,
            blogName: postInDb.blogName,
            createdAt:postInDb.createdAt
        };
    },

    editPostById: async (id: string, post: PostInputModelDto): Promise<boolean> => {
        const {title, shortDescription, content, blogId} = post;
        const blogName =(await getBlogById(blogId))?.name
        if (!blogName) return false;
        const postToDb: PostEditEntity = {
            title,
            blogId,
            content,
            shortDescription,
            blogName
        };
        return await updatePostById(id, postToDb);
    },

    deletePostById: async (id: string): Promise<boolean> => {
        return deletePostById(id);
    },
};