import {LikesInfoViewModelInterface} from '../../controllers/dto/viewModels/likesInfoViewModel.interface';

export interface CommentEntity {
    content: string;
    postId:string;
    userId: string;
    userLogin: string;
    createdAt: string;
}