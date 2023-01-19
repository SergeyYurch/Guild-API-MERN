import {
    BlogModel,
    PostModel,
    UserModel,
} from "../adapters/dbAdapters";
import {
    PaginatorOptionInterface,
} from "./interfaces/query.repository.interface";
import {BlogViewModelDto} from "../controllers/dto/viewModels/blogViewModel.dto";
import {PostViewModelDto} from "../controllers/dto/viewModels/postViewModel.dto";
import {PaginatorDto} from "../controllers/dto/paginator.dto";
import {UserViewModelDto} from "../controllers/dto/viewModels/userViewModel.dto";
import {pagesCount} from "../helpers/helpers";
import {UserEntityWithIdInterface} from './repository-interfaces/user-entity-with-id.interface';
import {injectable} from 'inversify';
import {UsersRepository} from './users.repository';
import {LikesRepository} from './likes.repository';
import {WithId} from 'mongodb';
import {PostEntity} from '../services/entities/post.entity';

@injectable()
export class QueryRepository {
    constructor(
        protected usersRepository: UsersRepository,
        protected likesRepository: LikesRepository
    ) {
    }

    async castPostViewModelDto(postInDb: WithId<PostEntity> | null, userId?: string): Promise<PostViewModelDto> {
        console.log(`[queryRepository]: ${(new Date()).toISOString()} - start getAllBlogs`);
        const {title, shortDescription, content, blogId, blogName, createdAt, _id} = postInDb!;
        const postId = _id.toString();
        const likeInfo = await this.likesRepository.getLikesCount(postId);
        if (userId) {
            likeInfo.myStatus = await this.likesRepository.getUserLikeStatus(userId, postId);
        }
        const newestLikes = await this.likesRepository.getNewestLikes(postId);

        return {
            id: _id.toString(),
            title,
            shortDescription,
            content,
            blogId,
            blogName,
            createdAt,
            extendedLikesInfo: {
                likesCount: likeInfo.likesCount,
                dislikesCount: likeInfo.dislikesCount,
                myStatus: likeInfo.myStatus,
                newestLikes
            }
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
        const posts = await PostModel.find(filter)
            .sort({[sortBy]: sortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);
        const items: PostViewModelDto[] = []
        for(let post of posts){
            items.push(await this.castPostViewModelDto(post))
        }
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
        const posts = await PostModel.find({})
            .sort({[sortBy]: sortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        const items: PostViewModelDto[] = []
        for(let post of posts){
            items.push(await this.castPostViewModelDto(post))
        }
        return {
            pagesCount: pagesCount(totalCount, pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items
        };
    }

    async getPostById(postId: string, userId?: string): Promise<PostViewModelDto | null> {
        console.log(`[queryRepository]: ${(new Date()).toISOString()} - start getPostById`);
        const postInDb = await PostModel.findById(postId);
        console.log(`[queryRepository]:!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`)
        console.log(postId);
        if (!postInDb) return null
        return this.castPostViewModelDto(postInDb, userId);
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
        return this.usersRepository.parseUserInDbEntity(result);
    }
}