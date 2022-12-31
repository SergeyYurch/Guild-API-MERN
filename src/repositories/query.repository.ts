import {blogsCollection, commentsCollection, postsCollection, usersCollection} from "../adapters/dbAdapters";
import {ObjectId} from "mongodb";
import {
    PaginatorOptionInterface,
    QueryRepositoryInterface
} from "./interfaces/query.repository.interface";
import {BlogViewModelDto} from "../controllers/dto/blogViewModel.dto";
import {PostViewModelDto} from "../controllers/dto/postViewModel.dto";
import {PaginatorDto} from "../controllers/dto/paginatorDto";
import {UserViewModelDto} from "../controllers/dto/userViewModel.dto";
import {pagesCount} from "../helpers/helpers";
import {CommentViewModelDto} from "../controllers/dto/commentViewModel.dto";

export const queryRepository: QueryRepositoryInterface = {
    getCommentById: async (id: string): Promise<CommentViewModelDto | null> => {
        const result = await commentsCollection.findOne({_id: new ObjectId(id)});
        if (!result) return null;
        return {
            id: result._id.toString(),
            userId: result.userId.toString(),
            userLogin: result.userLogin,
            content: result.content,
            createdAt: result.createdAt
        };
    },
    findAllCommentsByUserId: async (
        userId: string,
        paginatorOption: PaginatorOptionInterface
    ): Promise<PaginatorDto<CommentViewModelDto>> => {
        // console.log(`[findUserByEmailOrLogin]: loginOrEmail:${loginOrEmail}`);
        const {sortBy, sortDirection, pageSize, pageNumber} = paginatorOption;
        const totalCount = await commentsCollection.count({userId});
        const result = await commentsCollection.find({userId})
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();
        const items: CommentViewModelDto[] = result.map(e => ({
            id: e._id.toString(),
            content: e.content,
            userId: e.userId.toString(),
            userLogin: e.userLogin,
            createdAt: e.createdAt
        }));
        return {
            pagesCount: pagesCount(totalCount, pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items
        };
    },
    findAllCommentsByPostId: async (
        postId: string,
        paginatorOption: PaginatorOptionInterface
    ): Promise<PaginatorDto<CommentViewModelDto>> => {
        // console.log(`[findUserByEmailOrPassword]: loginOrEmail:${loginOrEmail}`);
        const {sortBy, sortDirection, pageSize, pageNumber} = paginatorOption;
        const totalCount = await commentsCollection.count({postId});
        const result = await commentsCollection.find({postId})
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();
        const items: CommentViewModelDto[] = result.map(e => ({
            id: e._id.toString(),
            content: e.content,
            userId: e.userId.toString(),
            userLogin: e.userLogin,
            createdAt: e.createdAt
        }));
        return {
            pagesCount: pagesCount(totalCount, pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items
        };
    },

    getAllBlogs: async (
        searchNameTerm: string | null = null,
        paginatorOption: PaginatorOptionInterface
    ): Promise<PaginatorDto<BlogViewModelDto>> => {
        console.log(`[queryRepository]: ${(new Date()).toISOString()} - start getAllBlogs`);
        const {sortBy, sortDirection, pageSize, pageNumber} = paginatorOption;
        const filter = searchNameTerm ? {'name': {$regex: searchNameTerm, $options: 'i'}} : {};
        const totalCount = await blogsCollection.count(filter);
        const result = await blogsCollection.find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();
        const items: BlogViewModelDto[] = result.map(e => ({
                id: e._id.toString(),
                name: e.name,
                description: e.description,
                websiteUrl: e.websiteUrl,
                createdAt: e.createdAt
            })
        );
        return {
            pagesCount: pagesCount(totalCount, pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items
        };
    },

    getPostsForBlog: async (
        blogId: string,
        paginatorOption: PaginatorOptionInterface
    ): Promise<PaginatorDto<PostViewModelDto>> => {
        console.log(`[queryRepository]: ${(new Date()).toISOString()} - start getPostsForBlog ${blogId}.`);

        const filter = {blogId: blogId};
        const {sortBy, sortDirection, pageSize, pageNumber} = paginatorOption;
        const totalCount = await postsCollection.count(filter);
        const result = await postsCollection.find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();
        const items: PostViewModelDto[] = result.map(e => ({
                id: e._id.toString(),
                title: e.title,
                shortDescription: e.shortDescription,
                content: e.content,
                blogId: e.blogId,
                blogName: e.blogName,
                createdAt: e.createdAt
            })
        );
        return {
            pagesCount: pagesCount(totalCount, pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items
        };
    },

    getBlogById: async (id: string): Promise<BlogViewModelDto | null> => {
        console.log(`[queryRepository]: ${(new Date()).toISOString()} - start getBlogById`);
        const result = await blogsCollection.findOne({_id: new ObjectId(id)});
        if (!result) return null;
        const {name, websiteUrl, description, createdAt, _id} = result;
        return {
            id: _id.toString(),
            name,
            description,
            websiteUrl,
            createdAt
        };
    },

    getAllPosts: async (
        paginatorOption: PaginatorOptionInterface
    ): Promise<PaginatorDto<PostViewModelDto>> => {
        console.log(`[queryRepository]: ${(new Date()).toISOString()} - start getAllPosts`);
        const {sortBy, sortDirection, pageSize, pageNumber} = paginatorOption;
        const totalCount = await postsCollection.count({});
        const result = await postsCollection.find({})
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();
        const items: PostViewModelDto[] = result.map(e => ({
                id: e._id.toString(),
                title: e.title,
                shortDescription: e.shortDescription,
                content: e.content,
                blogId: e.blogId,
                blogName: e.blogName,
                createdAt: e.createdAt
            })
        );
        return {
            pagesCount: pagesCount(totalCount, pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items
        };
    },
    getPostById: async (id: string): Promise<PostViewModelDto | null> => {
        console.log(`[queryRepository]: ${(new Date()).toISOString()} - start getPostById`);
        const result = await postsCollection.findOne({_id: new ObjectId(id)});
        if (!result) return null;
        const {title, shortDescription, content, blogId, blogName, createdAt, _id} = result;
        return {
            id: _id.toString(),
            title,
            shortDescription,
            content,
            blogId,
            blogName,
            createdAt
        };
    },

    getAllUsers: async (paginatorOption: PaginatorOptionInterface,
                        searchLoginTerm: string | null,
                        searchEmailTerm: string | null
    ): Promise<PaginatorDto<UserViewModelDto>> => {

        const {sortBy, sortDirection, pageSize, pageNumber} = paginatorOption;
        const searchQuery = [];
        let filter = {};
        if (searchLoginTerm) searchQuery.push({login: {$regex: searchLoginTerm, $options: 'i'}});
        if (searchEmailTerm) searchQuery.push({email: {$regex: searchEmailTerm, $options: 'i'}});
        console.log('searchQuery=============================');
        console.log(searchQuery);
        if (searchQuery.length > 0) filter = {$or: searchQuery};
        const totalCount = await usersCollection.count(filter);
        const result = await usersCollection.find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();
        const items: UserViewModelDto[] = result.map(e => ({
            id: e._id.toString(),
            login: e.accountData.login,
            email: e.accountData.email,
            createdAt: e.accountData.createdAt.toISOString()
        }));
        return {
            pagesCount: pagesCount(totalCount, pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items
        };
    }
};