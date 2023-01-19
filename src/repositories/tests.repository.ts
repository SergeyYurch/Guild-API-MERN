import {
    AccessAttemptModel, BlogModel,
    CommentModel,
    SessionModel, UserModel,
    PostModel, LikeModel,
} from "../adapters/dbAdapters";
import {injectable} from 'inversify';

@injectable()
export class TestsRepository {
    async dataBaseClear(): Promise<boolean> {
        await console.log(`[repository]:start dataBaseClear`);
        const blogsDeleteResult = await BlogModel.deleteMany({});

        const postsDeleteResult = await PostModel.deleteMany({});
        const usersDeleteResult = await UserModel.deleteMany({});
        const commentsDeleteResult = await CommentModel.deleteMany({});
        const sessionsDeleteResult = await SessionModel.deleteMany({});
        const accessAttemptsDeleteResult = await AccessAttemptModel.deleteMany({});
        const likesDeleteResult = await LikeModel.deleteMany({});
        return blogsDeleteResult.acknowledged
            && postsDeleteResult.acknowledged
            && usersDeleteResult.acknowledged
            && commentsDeleteResult.acknowledged
            && sessionsDeleteResult.acknowledged
            && accessAttemptsDeleteResult.acknowledged
            && likesDeleteResult.acknowledged;
    }
}
