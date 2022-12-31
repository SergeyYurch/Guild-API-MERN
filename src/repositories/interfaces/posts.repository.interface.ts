import {PostEntity} from "../../services/entities/post.entity";
import {WithId} from "mongodb";
import {PostEditEntity} from "../../services/entities/postEdit.entity";

export interface PostsRepositoryInterface {
    createNewPost: (inputPost: PostEntity) => Promise<WithId<PostEntity> | null>;
    updatePostById: (id: string, inputPost: PostEditEntity) => Promise<boolean>;
    deletePostById: (id: string) => Promise<boolean>;
}