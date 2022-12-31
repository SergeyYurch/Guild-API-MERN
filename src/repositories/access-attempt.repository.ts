import {accessAttemptCollection} from "../adapters/dbAdapters";
import {sub} from "date-fns";

const clearOldAttempt = async (createdAt: Date) => {
    const timeLimit = sub(createdAt, {seconds: 10});
    return await accessAttemptCollection.deleteMany({createdAt: {$lt: timeLimit}});
};


export const accessAttemptRepository = {
    async saveAttempt(ip: string, endpoint: string): Promise<boolean> {
        const createdAt = new Date();
        await clearOldAttempt(createdAt);
        const result = await accessAttemptCollection.insertOne({
            ip,
            endpoint,
            createdAt
        });
        return result.acknowledged;
    },
    async getNumberOfAttemptsByIp(ip: string, endpoint: string): Promise<number> {
        const createdAt = new Date();
        await clearOldAttempt(createdAt);
        const result = await accessAttemptCollection.find({ip, endpoint}).toArray();
        return result.length;
    }
};
