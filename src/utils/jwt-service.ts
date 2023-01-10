import * as dotenv from "dotenv";
import jwt from 'jsonwebtoken';
import {
    UserInfoInRefreshToken
} from "../helpers/interfaces/user-info-in-refresh-token.interface";
import {ACCESS_TOKEN_LIFE_PERIOD, REFRESH_TOKEN_LIFE_PERIOD} from '../settings-const';
import add from 'date-fns/add';

dotenv.config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || '11';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '22';


export type TypeJWT = 'access' | 'refresh'


export const jwtService = {
    async createAccessJWT(userId: string) {
        const expiresIn = ACCESS_TOKEN_LIFE_PERIOD.amount + ACCESS_TOKEN_LIFE_PERIOD.units[0];
        console.log('[jwtService]expiresIn accessToken:' + expiresIn);
        return jwt.sign(
            {userId},
            JWT_ACCESS_SECRET,
            {expiresIn}
        );
    },

    async createRefreshJWT(userId: string, deviceId: string, ip: string) {
        const expiresIn = REFRESH_TOKEN_LIFE_PERIOD.amount + REFRESH_TOKEN_LIFE_PERIOD.units[0];
        console.log('[jwtService]expiresIn refreshToken:' + expiresIn);
        return jwt.sign(
            {userId, deviceId, ip},
            JWT_REFRESH_SECRET,
            {expiresIn}
        );
    },

    getLastActiveDateFromRefreshToken(refreshToken: string) {
        const payload: any = jwt.decode(refreshToken);
        return new Date(payload.iat * 1000);
    },

    async getUserIdByJwtToken(token: string, type: TypeJWT) {
        try {
            const result: any = jwt.verify(
                token,
                type === 'access' ? JWT_ACCESS_SECRET : JWT_REFRESH_SECRET
            );
            return result.userId;
        } catch (error) {
            return null;
        }
    },

    verifyJwtToken(token: string, type: TypeJWT): boolean {
        try {
            const result: any = jwt.verify(
                token,
                type === 'access' ? JWT_ACCESS_SECRET : JWT_REFRESH_SECRET
            );
            return !!result;
        } catch (error) {
            return false;
        }
    },

    getSessionInfoByJwtToken(token: string): UserInfoInRefreshToken {
        const payload: any = jwt.decode(token);
        return ({
            userId: payload.userId,
            deviceId: payload.deviceId,
            ip: payload.ip,
            lastActiveDate: String(payload.iat * 1000),
            expiresDate: String(payload.exp * 1000),

        });
    }

};