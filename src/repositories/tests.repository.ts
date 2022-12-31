import {
    RepositoryInterface
} from "./interfaces/repository.interface";
import {
    accessAttemptCollection,
    blogsCollection,
    commentsCollection,
    deviceAuthSessionsCollection,
    postsCollection,
    usersCollection
} from "../adapters/dbAdapters";

export const testsRepository: RepositoryInterface = {
    dataBaseClear: async (): Promise<boolean> => {
        console.log(`[repository]:start dataBaseClear`);
        const resultBlogs = await blogsCollection.deleteMany({});
        const resultPosts = await postsCollection.deleteMany({});
        const resultUsers = await usersCollection.deleteMany({});
        const resultComments = await commentsCollection.deleteMany({});
        const resultDeviceAuthSession = await deviceAuthSessionsCollection.deleteMany({});
        const resultAccessAttempt = await accessAttemptCollection.deleteMany({});
        return resultBlogs.acknowledged
            && resultPosts.acknowledged
            && resultUsers.acknowledged
            && resultComments.acknowledged
            &&resultDeviceAuthSession.acknowledged
            && resultAccessAttempt.acknowledged;
    }

};