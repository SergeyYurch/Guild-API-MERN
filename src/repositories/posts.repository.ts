import {PostEntity} from "../services/entities/post.entity";
import {PostModel, postsCollection} from "../adapters/dbAdapters";
import {ObjectId, WithId} from "mongodb";
import {PostEditEntity} from "../services/entities/postEdit.entity";
import {PostsRepositoryInterface} from "./interfaces/posts.repository.interface";

export const postsRepository: PostsRepositoryInterface = {

    createNewPost: async (inputPost: PostEntity): Promise<WithId<PostEntity> | null> => {
        console.log(`[repository]:start createNewPost`);
        return await PostModel.create(inputPost);
    },

    updatePostById: async (id: string, inputPost: PostEditEntity): Promise<boolean> => {
        console.log(`[repository]:start updatePostById`);
        const result = await PostModel.updateOne({_id: new ObjectId(id)}, {$set: inputPost});
        return result.acknowledged;
    },

    deletePostById: async (id: string): Promise<boolean> => {
        console.log(`[repository]:start deletePostById`);
        const result = await PostModel.deleteOne({_id: new ObjectId(id)});
        return result.acknowledged;
    }
};