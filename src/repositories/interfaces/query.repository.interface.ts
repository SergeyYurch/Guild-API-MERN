import {BlogViewModelDto} from "../../controllers/dto/blogViewModel.dto";
import {PostViewModelDto} from "../../controllers/dto/postViewModel.dto";
import {PaginatorDto} from "../../controllers/dto/paginatorDto";
import {UserViewModelDto} from "../../controllers/dto/userViewModel.dto";
import {WithId} from "mongodb";
import {CommentEntity} from "../../services/entities/comment.entity";
import {CommentViewModelDto} from "../../controllers/dto/commentViewModel.dto";


export interface PaginatorOptionInterface {
    pageNumber: number;
    pageSize: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
}

export interface QueryRepositoryInterface {
    getCommentById:(id:string)=> Promise<CommentViewModelDto | null>
    findAllCommentsByUserId: (
        userId: string,
        paginatorOption: PaginatorOptionInterface
    ) => Promise<PaginatorDto<CommentViewModelDto>>;
    findAllCommentsByPostId: (
        postId: string,
        paginatorOption: PaginatorOptionInterface
    ) => Promise<PaginatorDto<CommentViewModelDto>>;
    getAllBlogs: (
        searchNameTerm: string | null,
        paginatorOption: PaginatorOptionInterface
    ) => Promise<PaginatorDto<BlogViewModelDto>>;
    getPostsForBlog: (
        blogId: string,
        paginatorOption: PaginatorOptionInterface
    ) => Promise<PaginatorDto<PostViewModelDto> | null>;
    getBlogById: (id: string) => Promise<BlogViewModelDto | null>;
    getAllPosts: (
        paginatorOption: PaginatorOptionInterface
    ) => Promise<PaginatorDto<PostViewModelDto>>;
    getPostById: (id: string) => Promise<PostViewModelDto | null>;
    getAllUsers: (
        paginatorOption: PaginatorOptionInterface,
        searchLoginTerm: string | null,
        searchEmailTerm: string | null
    ) => Promise<PaginatorDto<UserViewModelDto>>;
}