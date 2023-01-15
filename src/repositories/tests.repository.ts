import {
    AccessAttemptModel, BlogModel,
    CommentModel,
    SessionModel, UserModel,
    PostModel,
} from "../adapters/dbAdapters";
import {injectable} from 'inversify';

@injectable()
export class TestsRepository {
    async dataBaseClear(): Promise<boolean>{
        console.log(`[repository]:start dataBaseClear`);
        const resultBlogs = await BlogModel.deleteMany({});
        const resultPosts = await PostModel.deleteMany({});
        const resultUsers = await UserModel.deleteMany({});
        const resultComments = await CommentModel.deleteMany({});
        const resultDeviceAuthSession = await SessionModel.deleteMany({});
        const resultAccessAttempt = await AccessAttemptModel.deleteMany({});
        return resultBlogs.acknowledged
            && resultPosts.acknowledged
            && resultUsers.acknowledged
            && resultComments.acknowledged
            && resultDeviceAuthSession.acknowledged
            && resultAccessAttempt.acknowledged;
    }
}