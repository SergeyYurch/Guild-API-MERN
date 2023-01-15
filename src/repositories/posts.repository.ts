import {PostEntity} from "../services/entities/post.entity";
import {PostModel} from "../adapters/dbAdapters";
import {ObjectId, WithId} from "mongodb";
import {PostEditEntity} from "../services/entities/postEdit.entity";
import {injectable} from 'inversify';

@injectable()
export class PostsRepository {

    async createNewPost(inputPost: PostEntity): Promise<WithId<PostEntity> | null> {
        console.log(`[repository]:start createNewPost`);
        return await PostModel.create(inputPost);
    }

    async updatePostById(id: string, inputPost: PostEditEntity): Promise<boolean> {
        console.log(`[repository]:start updatePostById`);
        const result = await PostModel.updateOne({_id: new ObjectId(id)}, {$set: inputPost});
        return result.acknowledged;
    }

    async deletePostById(id: string): Promise<boolean> {
        console.log(`[repository]:start deletePostById`);
        const result = await PostModel.deleteOne({_id: new ObjectId(id)});
        return result.acknowledged;
    }
}