import {UserEntity} from '../../services/entities/user.entity';

export interface UserEntityWithIdInterface extends UserEntity{
    id:string
}