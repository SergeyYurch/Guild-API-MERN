import {
    BlogModel,
    blogsCollection,
    CommentModel,
    commentsCollection, PostModel,
    postsCollection,
    UserModel,
    usersCollection
} from "../adapters/dbAdapters";
import {ObjectId, WithId} from "mongodb";
import {
    PaginatorOptionInterface,
} from "./interfaces/query.repository.interface";
import {BlogViewModelDto} from "../controllers/dto/blogViewModel.dto";
import {PostViewModelDto} from "../controllers/dto/postViewModel.dto";
import {PaginatorDto} from "../controllers/dto/paginatorDto";
import {UserViewModelDto} from "../controllers/dto/userViewModel.dto";
import {pagesCount} from "../helpers/helpers";
import {CommentViewModelDto} from "../controllers/dto/commentViewModel.dto";
import {UserEntityWithIdInterface} from './repository-interfaces/user-entity-with-id.interface';
import {UserEntity} from '../services/entities/user.entity';

export const queryRepository = {
    getCommentById: async (id: string): Promise<CommentViewModelDto | null> => {
        const result = await CommentModel.findById(id);
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
        console.log(`[queryRepository]: findAllCommentsByUserId:${userId}`);
        const {sortBy, sortDirection, pageSize, pageNumber} = paginatorOption;

        const totalCount = await CommentModel.countDocuments({userId});
        const result = await CommentModel.find({userId})
            .sort({[sortBy]: sortDirection })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

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
        console.log(`[queryRepository]: findAllCommentsByPostId:${postId}`);
        const {sortBy, sortDirection, pageSize, pageNumber} = paginatorOption;
        const totalCount = await CommentModel.countDocuments({postId});
        const result = await CommentModel.find({postId})
            .sort({[sortBy]: sortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
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
        const totalCount = await BlogModel.countDocuments(filter);
        const result = await BlogModel.find(filter)
            .sort({[sortBy]: sortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
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
        const totalCount = await PostModel.countDocuments(filter);
        const result = await PostModel.find(filter)
            .sort({[sortBy]: sortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
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
        const result = await BlogModel.findById(id);
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
        const totalCount = await PostModel.countDocuments({});
        const result = await PostModel.find({})
            .sort({[sortBy]: sortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
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
        const result = await PostModel.findById(id)
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
        if (searchQuery.length > 0) filter = {$or: searchQuery};
        const totalCount = await UserModel.countDocuments(filter);
        const result = await UserModel.find(filter)
            .sort({[sortBy]: sortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
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
    },
    async getUserById(id: string): Promise<UserEntityWithIdInterface | null> {
        console.log(`[queryRepository]: getUserById ${id}`);
        const result = await UserModel.findById(id);
        console.log(`[queryRepository]: getUserById ${id} `);
        if (!result) return null;
        return this.parseUserInDbEntity(result);
    },
    parseUserInDbEntity(result: WithId<UserEntity>): UserEntityWithIdInterface {
        console.log('[queryRepository]/parseUserInDbEntity');
        return ({
            id: result._id.toString(),
            accountData: {
                login: result.accountData.login,
                email: result.accountData.email,
                passwordHash: result.accountData.passwordHash,
                passwordSalt: result.accountData.passwordSalt,
                createdAt: result.accountData.createdAt
            },
            emailConfirmation: {
                confirmationCode: result.emailConfirmation.confirmationCode,
                expirationDate: result.emailConfirmation.expirationDate,
                isConfirmed: result.emailConfirmation.isConfirmed,
                dateSendingConfirmEmail: result.emailConfirmation.dateSendingConfirmEmail
            }
        });
    }
};