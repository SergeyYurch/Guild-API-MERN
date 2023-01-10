import {CommentEntity} from '../../services/entities/comment.entity';

export interface CommentEntityWithIdInterface extends CommentEntity{
    id:string
}