import {LikeModel} from "../adapters/dbAdapters";
import {LikeEntity} from '../services/entities/like.entity';
import {LikeStatus, LikeStatusType} from './interfaces/likeStatus.type';
import {LikesInfoViewModelInterface} from '../controllers/dto/viewModels/likesInfoViewModel.interface';
import {injectable} from 'inversify';
import {LikeDetailsViewModel} from '../controllers/dto/viewModels/ likeDetailsViewModel';

@injectable()
export class LikesRepository {

    async updateLikeItem(targetId: string, userId: string, login: string, likeStatus: LikeStatusType): Promise<boolean> {
        console.log(`[LikesRepository]:start updateLike`);
        const like = await LikeModel.findOne({userId, targetId});
        if (!like) {
            const likeItem: LikeEntity = {
                userId,
                login,
                targetId,
                likeStatus,
                addedAt: new Date()
            };
            const newLikeItem = new LikeModel(likeItem);
            let result = true;
            await newLikeItem.save(error => result = !!error);
            return result;
        }

        like.likeStatus = likeStatus;
        let result = true;
        await like.save(err => result = !!err);
        return result;
    }

    async getLikesCount(targetId: string): Promise<LikesInfoViewModelInterface> {
        console.log(`[LikesRepository]:start getCommentLikesCount`);
        const likesCount = await LikeModel.countDocuments({targetId, likeStatus: LikeStatus.like});
        const dislikesCount = await LikeModel.countDocuments({targetId, likeStatus: LikeStatus.dislike});
        console.log(`likesCount: ${likesCount}, dislikesCount: ${dislikesCount}`);
        return {likesCount, dislikesCount, myStatus: LikeStatus.none};
    }

    async getUserLikeStatus(userId: string, targetId: string): Promise<LikeStatusType> {
        console.log(`[LikesRepository]:start getUserStatus`);
        const myStatus = (await LikeModel.findOne({targetId}).where({userId}).exec())?.likeStatus;
        console.log(`[LikesRepository]:start getUserStatus  : ${myStatus}`);

        return myStatus || LikeStatus.none;
    }

    async getNewestLikes(targetId: string): Promise<null | LikeDetailsViewModel[]> {
        console.log(`[LikesRepository]:start getUserStatus`);
        const likes = await LikeModel.find({targetId, likeStatus: 'Like'}).sort({addedAt: -1}).limit(3);
        console.log('[LikesRepository]!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.log(likes);
        if (likes.length < 1) return null;

        const lastLikeUsers: LikeDetailsViewModel[] = [];
        for (let like of likes) {

            const user: LikeDetailsViewModel = {
                login: like.login,
                userId: like.userId,
                addedAt: String(like.addedAt)
            };
            lastLikeUsers.push(user);
        }
        return lastLikeUsers;
    }

}
