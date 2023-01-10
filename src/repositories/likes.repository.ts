import { LikeModel} from "../adapters/dbAdapters";
import {LikeEntity} from '../services/entities/like.entity';
import {LikeStatus, LikeStatusType} from './interfaces/likeStatus.type';
import {LikesInfoViewModelInterface} from '../controllers/dto/viewModels/likesInfoViewModel.interface';

export class LikesRepository {

    // async createNewLike(like: LikeEntity): Promise<WithId<LikeEntity> | null> {
    //     console.log(`[LikesRepository]:start createNewLike`);
    //     return await LikeModel.create(like);
    // }

    async updateLikeItem( commentId: string, userId: string, likeStatus: LikeStatusType): Promise<boolean> {
        console.log(`[LikesRepository]:start updateLike`);
        const like = await LikeModel.findOne({userId, commentId});
        if (!like) {
            const likeItem:LikeEntity = {
                userId,
                commentId,
                likeStatus,
                createdAt: new Date()
            }
            const newLikeItem = new LikeModel(likeItem)
            let result= true
            await newLikeItem.save(error => result=!!error)
            return result
        }

        like.likeStatus = likeStatus;
        let result = true;
        await like.save(err => result = !!err);
        return result;
    }

    async getCommentLikesCount(commentId: string ):Promise<LikesInfoViewModelInterface> {
        console.log(`[LikesRepository]:start getCommentLikesCount`);
        const likesCount = await LikeModel.countDocuments({commentId, likeStatus: LikeStatus.like})
        const dislikesCount = await LikeModel.countDocuments({commentId, likeStatus: LikeStatus.dislike})
        console.log(`likesCount: ${likesCount}, dislikesCount: ${dislikesCount}`);
        return {likesCount, dislikesCount, myStatus: LikeStatus.none}
    }

    async getUserLikeStatus (userId: string, commentId: string):Promise<LikeStatusType> {
        console.log(`[LikesRepository]:start getUserStatus`);
        const myStatus = (await LikeModel.findOne({commentId}).where({userId}).exec())?.likeStatus
        console.log(`[LikesRepository]:start getUserStatus  : ${myStatus}`);

        return myStatus || LikeStatus.none
    }

    // async deleteLikeById(id: string): Promise<boolean> {
    //     console.log(`[LikesRepository]:deleteLikeById`);
    //     const result = await BlogModel.deleteOne({_id: new ObjectId(id)});
    //     return result.acknowledged;
    // }
}
