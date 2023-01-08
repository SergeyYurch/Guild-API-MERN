import {CommentViewModelDto} from "../controllers/dto/commentViewModel.dto";
import {CommentInputModelDto} from "../controllers/dto/commentInputModel.dto";
import {CommentEntity} from "./entities/comment.entity";
import {CommentsRepository} from "../repositories/comments.repository";
import {QueryRepository} from '../repositories/query.repository';


export class CommentsService {
    private queryRepository: QueryRepository;
    private commentsRepository: CommentsRepository;

    constructor() {
        this.queryRepository = new QueryRepository();
        this.commentsRepository = new CommentsRepository();
    }

    async createUserComment(content: string, userId: string, postId: string): Promise<CommentViewModelDto | null> {
        const createdAt = new Date().toISOString();
        const user = await this.queryRepository.getUserById(userId);
        const userLogin = user!.accountData.login;
        const newUserComment: CommentEntity = {
            userId, createdAt, content, userLogin, postId
        };
        const result = await this.commentsRepository.createNewUserComment(newUserComment);
        if (result) return {
            id: result.toString(),
            content,
            userId,
            userLogin,
            createdAt
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
}
