import {AccessAttemptModel} from "../adapters/dbAdapters";
import {sub} from "date-fns";

export class AccessAttemptRepository {
    async clearOldAttempt() {
        console.log(`[accessAttemptRepository]:clearOldAttempt`);
        const timeLimit = sub(new Date(), {seconds: 10});
        console.log(`[accessAttemptRepository]:clearOldAttempt: timeLimit:${timeLimit}`);
        return AccessAttemptModel.deleteMany({createdAt: {$lt: timeLimit}});
    }

    async saveAttempt(ip: string, endpoint: string): Promise<boolean> {
        console.log(`[accessAttemptRepository]:saveAttempt`);
        const createdAt = new Date();
        await this.clearOldAttempt();
        const result = await AccessAttemptModel.create({
            ip,
            endpoint,
            createdAt
        });
        return !!result;
    }

    async getNumberOfAttemptsByIp(ip: string, endpoint: string): Promise<number> {
        console.log(`[accessAttemptRepository]:getNumberOfAttemptsByIp`);
        await this.clearOldAttempt();
        const result = await AccessAttemptModel.find({ip, endpoint});
        console.log(`[accessAttemptRepository]:getNumberOfAttemptsByIp/ count = ${result.length}`);
        return result.length;
    }
}
