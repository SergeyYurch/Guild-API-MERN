import {CommentModel,} from "../adapters/dbAdapters";
import {PaginatorOptionInterface,} from "./interfaces/query.repository.interface";
import {PaginatorDto} from "../controllers/dto/paginator.dto";
import {pagesCount} from "../helpers/helpers";
import {CommentViewModelDto} from "../controllers/dto/viewModels/commentViewModel.dto";
import {WithId} from 'mongodb';
import {CommentEntity} from '../services/entities/comment.entity';
import {LikesRepository} from './likes.repository';
import {LikesInfoViewModelInterface} from '../controllers/dto/viewModels/likesInfoViewModel.interface';

export class QueryCommentsRepository {
    private likeRepository: LikesRepository;

    constructor() {
        this.likeRepository = new LikesRepository();
    }

    async castToCommentViewModel(comment: WithId<CommentEntity>, userId: string | null): Promise<CommentViewModelDto> {
        const commentId = comment._id.toString();
        const likesInfo: LikesInfoViewModelInterface = await this.likeRepository.getCommentLikesCount(commentId);
        if (userId) likesInfo.myStatus = await this.likeRepository.getUserLikeStatus(userId, commentId);
        return {
            id: commentId,
            content: comment.content,
            userId: comment.userId.toString(),
            userLogin: comment.userLogin,
            createdAt: comment.createdAt,
            likesInfo
        };
    }

    async getCommentById(commentId: string, userId: string | null): Promise<CommentViewModelDto | null> {
        const commentInDb = await CommentModel.findById(commentId);
        if (!commentInDb) return null;
        return this.castToCommentViewModel(commentInDb, userId);
    }
    //
    // async findAllCommentsByUserId(
    //     userId: string | null,
    //     paginatorOption: PaginatorOptionInterface
    // ): Promise<PaginatorDto<CommentViewModelDto>> {
    //     console.log(`[queryRepository]: findAllCommentsByUserId:${userId}`);
    //     const {sortBy, sortDirection, pageSize, pageNumber} = paginatorOption;
    //     const items: CommentViewModelDto[] = [];
    //     const totalCount = await CommentModel.countDocuments({userId});
    //     const commentsFormDb = await CommentModel.find({userId})
    //         .sort({[sortBy]: sortDirection})
    //         .skip((pageNumber - 1) * pageSize)
    //         .limit(pageSize);
    //
    //     for (const comment of commentsFormDb) {
    //         items.push(await this.castToCommentViewModel(comment, userId))
    //     }
    //     return {
    //         pagesCount: pagesCount(totalCount, pageSize),
    //         page: pageNumber,
    //         pageSize,
    //         totalCount,
    //         items
    //     };
    // }

    async findAllCommentsByPostId(
        userId: string | null,
        postId: string,
        paginatorOption: PaginatorOptionInterface
    ): Promise<PaginatorDto<CommentViewModelDto>> {
        console.log(`[queryRepository]: findAllCommentsByPostId:${postId}`);
        const {sortBy, sortDirection, pageSize, pageNumber} = paginatorOption;
        const totalCount = await CommentModel.countDocuments({postId});
        const items: CommentViewModelDto[] = [];

        const commentsFormDb = await CommentModel.find({postId})
            .sort({[sortBy]: sortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .exec();

        for (const comment of commentsFormDb) {
            items.push(await this.castToCommentViewModel(comment, userId))
        }

        return {
            pagesCount: pagesCount(totalCount, pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items
        };
    }


}