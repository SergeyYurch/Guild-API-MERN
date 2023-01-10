import {CommentViewModelDto} from "../controllers/dto/viewModels/commentViewModel.dto";
import {CommentInputModelDto} from "../controllers/dto/inputModels/commentInputModel.dto";
import {CommentEntity} from "./entities/comment.entity";
import {CommentsRepository} from "../repositories/comments.repository";
import {QueryRepository} from '../repositories/query.repository';
import {LikesRepository} from '../repositories/likes.repository';
import {LikeStatusType} from '../repositories/interfaces/likeStatus.type';


export class CommentsService {
    constructor(
        protected queryRepository: QueryRepository,
        protected commentsRepository: CommentsRepository,
        protected likesRepository: LikesRepository
    ) {
    }

    async createUserComment(content: string, userId: string, postId: string): Promise<CommentViewModelDto | null> {
        console.log(`[commentService]:createUserComment`);
        const createdAt = new Date().toISOString();
        const user = await this.queryRepository.getUserById(userId);
        const userLogin = user!.accountData.login;
        const newUserComment: CommentEntity = {
            userId,
            createdAt,
            content,
            userLogin,
            postId
        };
        const result = await this.commentsRepository.createNewUserComment(newUserComment);
        if (result) return {
            id: result.toString(),
            content,
            userId,
            userLogin,
            createdAt,
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: "None"
            }
        };
        return null;
    }

    async deleteCommentById(id: string): Promise<boolean> {
        return await this.commentsRepository.deleteUserCommentById(id);
    }

    async editComment(id: string, comment: CommentInputModelDto): Promise<boolean> {
        console.log(`[commentsService] comment id:${id} editing`);
        return await this.commentsRepository.editComment(id, comment);
    }

    async changeLikeStatusComment(commentId: string, userId: string, likeStatus: LikeStatusType): Promise<boolean> {
        console.log(`[commentsService] comment id:${commentId} like/dislike`);
        return await this.likesRepository.updateLikeItem(commentId, userId, likeStatus);
    }
}
