import {
    BlogModel,
    CommentModel,
    PostModel,
    UserModel,
} from "../adapters/dbAdapters";
import {
    PaginatorOptionInterface,
} from "./interfaces/query.repository.interface";
import {BlogViewModelDto} from "../controllers/dto/blogViewModel.dto";
import {PostViewModelDto} from "../controllers/dto/postViewModel.dto";
import {PaginatorDto} from "../controllers/dto/paginator.dto";
import {UserViewModelDto} from "../controllers/dto/userViewModel.dto";
import {pagesCount} from "../helpers/helpers";
import {CommentViewModelDto} from "../controllers/dto/commentViewModel.dto";
import {UserEntityWithIdInterface} from './repository-interfaces/user-entity-with-id.interface';
import {usersRepository} from './users.repository';

export class QueryRepository {
    async getCommentById(id: string): Promise<CommentViewModelDto | null> {
        const result = await CommentModel.findById(id);
        if (!result) return null;
        return {
            id: result._id.toString(),
            userId: result.userId.toString(),
            userLogin: result.userLogin,
            content: result.content,
            createdAt: result.createdAt
        };
    }

    async findAllCommentsByUserId(
        userId: string,
        paginatorOption: PaginatorOptionInterface
    ): Promise<PaginatorDto<CommentViewModelDto>> {
        console.log(`[queryRepository]: findAllCommentsByUserId:${userId}`);
        const {sortBy, sortDirection, pageSize, pageNumber} = paginatorOption;

        const totalCount = await CommentModel.countDocuments({userId});
        const result = await CommentModel.find({userId})
            .sort({[sortBy]: sortDirection})
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
    }

    async findAllCommentsByPostId(
        postId: string,
        paginatorOption: PaginatorOptionInterface
    ): Promise<PaginatorDto<CommentViewModelDto>> {
        console.log(`[queryRepository]: findAllCommentsByPostId:${postId}`);
        const {sortBy, sortDirection, pageSize, pageNumber} = paginatorOption;
        const totalCount = await CommentModel.countDocuments({postId});
        const result = await CommentModel.find({postId})
            .sort({[sortBy]: sortDirection})
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
    }

    async getAllBlogs(
        searchNameTerm: string | null = null,
        paginatorOption: PaginatorOptionInterface
    ): Promise<PaginatorDto<BlogViewModelDto>> {
        console.log(`[queryRepository]: ${(new Date()).toISOString()} - start getAllBlogs`);
        const {sortBy, sortDirection, pageSize, pageNumber} = paginatorOption;
        const filter = searchNameTerm ? {'name': {$regex: searchNameTerm, $options: 'i'}} : {};
        const totalCount = await BlogModel.countDocuments(filter);
        const result = await BlogModel.find(filter)
            .sort({[sortBy]: sortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);
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
    }

    async getPostsForBlog(
        blogId: string,
        paginatorOption: PaginatorOptionInterface
    ): Promise<PaginatorDto<PostViewModelDto>> {
        console.log(`[queryRepository]: ${(new Date()).toISOString()} - start getPostsForBlog ${blogId}.`);
        const filter = {blogId: blogId};
        const {sortBy, sortDirection, pageSize, pageNumber} = paginatorOption;
        const totalCount = await PostModel.countDocuments(filter);
        const result = await PostModel.find(filter)
            .sort({[sortBy]: sortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);
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
    }

    async getBlogById(id: string): Promise<BlogViewModelDto | null> {
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
    }

    async getAllPosts(
        paginatorOption: PaginatorOptionInterface
    ): Promise<PaginatorDto<PostViewModelDto>> {
        console.log(`[queryRepository]: ${(new Date()).toISOString()} - start getAllPosts`);
        const {sortBy, sortDirection, pageSize, pageNumber} = paginatorOption;
        const totalCount = await PostModel.countDocuments({});
        const result = await PostModel.find({})
            .sort({[sortBy]: sortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);
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
    }

    async getPostById(id: string): Promise<PostViewModelDto | null> {
        console.log(`[queryRepository]: ${(new Date()).toISOString()} - start getPostById`);
        const result = await PostModel.findById(id);
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
    }

    async getAllUsers(paginatorOption: PaginatorOptionInterface,
                      searchLoginTerm: string | null,
                      searchEmailTerm: string | null
    ): Promise<PaginatorDto<UserViewModelDto>> {
        console.log(`[queryRepository]: getAllUsers started...`);
        const {sortBy, sortDirection, pageSize, pageNumber} = paginatorOption;
        const searchQuery = [];
        let filter = {};
        if (searchLoginTerm) searchQuery.push({
            'accountData.login': new RegExp(searchLoginTerm, "i")
        });
        if (searchEmailTerm) searchQuery.push({
            'accountData.email': new RegExp(searchEmailTerm, "i")
        });
        if (searchQuery.length > 0) filter = {$or: searchQuery};
        console.log(filter);
        const totalCount = await UserModel.countDocuments(filter);
        console.log(totalCount);
        const result = await UserModel.find(filter)
            .sort({[sortBy]: sortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);
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

    async getUserById(id: string): Promise<UserEntityWithIdInterface | null> {
        console.log(`[queryRepository]: getUserById ${id}`);
        const result = await UserModel.findById(id);
        console.log(`[queryRepository]: getUserById ${id} `);
        if (!result) return null;
        return usersRepository.parseUserInDbEntity(result);
    }
};