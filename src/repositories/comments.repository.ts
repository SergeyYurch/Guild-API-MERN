import {commentsCollection} from "../adapters/dbAdapters";
import {ObjectId} from "mongodb";
import {CommentEntity} from "../services/entities/comment.entity";
import {CommentInputModelDto} from "../controllers/dto/commentInputModel.dto";

export const commentsRepository = {
    createNewUserComment: async (comment: CommentEntity): Promise<string | null> => {
        const result = await commentsCollection.insertOne(comment);
        if (result.acknowledged) return result.insertedId.toString();
        return null;
    },
    deleteUserCommentById: async (id: string): Promise<boolean> => {
        console.log(`[commentsRepository]: delete comment id: ${id}`);
        const result = await commentsCollection.deleteOne({_id: new ObjectId(id)});
        return result.acknowledged;
    },
    editComment:async (id: string, {content}:CommentInputModelDto): Promise<boolean> => {
        console.log(`[commentsRepository]: comment id: ${id} edit`);
        const result = await commentsCollection.updateOne({_id: new ObjectId(id)},{$set:{content}});
        console.log(result);
        return result.acknowledged;
    },
};