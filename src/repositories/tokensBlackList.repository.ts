import {tokensBlackListCollection} from "../adapters/dbAdapters";
import {RefreshTokenEntity} from "../services/entities/refresh-token.entity";

export const tokensBlackListRepository = {
    async saveTokenToBlackList(refreshToken: RefreshTokenEntity): Promise<boolean> {
        //сохраняем токен в базу и возвращаем true если операция была успешна
        console.log(`[tokensBlackListRepository]:saveTokenToBlackList token: ${refreshToken}`);
        const result = await tokensBlackListCollection.insertOne(refreshToken);
        return result.acknowledged;
    },
    async checkTokenInBlackList(refreshToken: string, userId:string): Promise<boolean> {
        console.log(`[tokensBlackListRepository]: checkTokenInBlackList ${refreshToken}`);
        //проверяем наличие такого токена в блек-листе и возвразщаем true если токет есть
        const result = await tokensBlackListCollection.findOne({ refreshToken});
        console.log(result);
        return !!result
    },

};