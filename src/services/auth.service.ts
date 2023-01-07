import {LoginInputModel} from "../controllers/dto/loginInputModel.dto";
import {usersRepository} from "../repositories/users.repository";
import {UserViewModelDto} from "../controllers/dto/userViewModel.dto";
import {
    generatePassHash,
    getConfirmationCode,
    getConfirmationEmailExpirationDate, getRecoveryPasswordCodeExpirationDate,
    parseUserViewModel
} from "../helpers/helpers";
import {emailManager} from "../managers/emailManager";
import add from 'date-fns/add';
import {SentMessageInfo} from "nodemailer";
import {jwtService} from "../utils/jwt-service";
import {UserTokensPairInterface} from "./entities/user-tokens-pair.interface";
import {authSessionsRepository} from "../repositories/auth-sessions.repository";
import {DeviceSessionViewModelDto} from "../controllers/dto/deviceSessionViewModel.dto";
import {AuthSessionInDb} from "../repositories/repository-interfaces/auth-session-in-db.interface";
import {ObjectId} from 'mongodb';
import {queryRepository} from '../repositories/query.repository';
import {ResultInterface} from '../types/result.interface';

export const authService = {

    async findCorrectConfirmationCode(code: string): Promise<boolean> {
        const user = await usersRepository.findUserByConfirmationCode(code);
        console.log(`[authService]: findCorrectConfirmationCode`);
        if (!user) return false;
        if (user.emailConfirmation.isConfirmed) return false;
        if (user.emailConfirmation.expirationDate < new Date()) return false;
        return true;
    },
    async checkCredentials(credentials: LoginInputModel): Promise<UserViewModelDto | null> {
        const {loginOrEmail, password} = credentials;
        const user = await usersRepository.findUserByEmailOrLogin(loginOrEmail);
        if (!user) return null;
        const passwordHash = generatePassHash(password, user.accountData.passwordSalt);
        if (passwordHash !== user.accountData.passwordHash) return null;
        if (!user.emailConfirmation.isConfirmed) return null;
        return parseUserViewModel(user);
    },
    async confirmEmail(code: string): Promise<boolean> {
        console.log(`[authService]:confirmEmail `);
        const user = await usersRepository.findUserByConfirmationCode(code);
        if (!user) return false;
        return await usersRepository.confirmEmailInDb(user.id);
    },
    async passwordRecovery(email: string) {
        console.log(`[authService]:passwordRecovery `);
        const user = await usersRepository.findUserByEmailOrLogin(email);
        if (!user) return;
        await usersRepository.confirmEmailInDb(user.id);
        const newConfirmationCode = getConfirmationCode();
        const newExpirationDate = getRecoveryPasswordCodeExpirationDate();
        const resend: SentMessageInfo = await emailManager.sendEmailPasswordRecoveryConfirmation(user.accountData.email, newConfirmationCode);
        if (resend.accepted.length > 0) await usersRepository.saveSendingRecoveryPasswordEmail(user.id, newConfirmationCode, newExpirationDate);
        return true;
    },
    async confirmPasswordRecovery(newPassword: string, recoveryCode: string): Promise<ResultInterface> {
        console.log(`[authService]:confirmPasswordRecovery init...`);
        const user = await usersRepository.findUserByPasswordRecoveryCode(recoveryCode);
        if (!user) return {status: false, code: 400, message: 'don\'t find user'};
        if (user.passwordRecoveryInformation?.recoveryCode !== recoveryCode) {
            console.log(`[usersService]:confirmPasswordRecovery recoveryCode is wrong`);
            return {status: false, code: 400, message: 'recoveryCode is wrong'};
        }
        if (user.passwordRecoveryInformation?.expirationDate < new Date()) {
            console.log(`[usersService]:confirmPasswordRecovery recoveryCode is expired`);
            return {status: false, code: 400, message: 'recoveryCode is expired'};
        }
        const passwordHash = generatePassHash(newPassword, user.accountData!.passwordSalt);
        console.log(`[authService]:confirmPasswordRecovery newPassword is confirmed, save new pass to DB`);
        const result = await usersRepository.confirmRecoveryPassword(user.id, passwordHash);
        if (!result) {
            console.log(`[usersService]:confirmPasswordRecovery error saving to DB`);
            return {status: false, code: 500, message: 'error saving to DB'};
        }
        return {status: true, code: 204, message: 'ok'};
    },
    async resendingEmail(id: string): Promise<boolean> {
        console.log(`[authService]:resendingEmail `);
        const user = await queryRepository.getUserById(id);
        console.log(`[usersService]: getUserById returned:`);
        console.log(user);

        if (!user) return false;
        if (user.emailConfirmation.isConfirmed) return false;
        const newConfirmationCode = getConfirmationCode();
        const newExpirationDate = getConfirmationEmailExpirationDate();
        await usersRepository.updateSendingConfirmEmail(user.id, newConfirmationCode, newExpirationDate);
        const sendingDates = user.emailConfirmation.dateSendingConfirmEmail;
        //Если было более 10 отправок письма и последняя менее 5 минут назад отбиваем
        if (sendingDates.length > 10
            && sendingDates.slice(-1)[0] < add(new Date(), {minutes: 5})) return false;
        const resend: SentMessageInfo = await emailManager.sendEmailConfirmation(user.accountData.email, newConfirmationCode);
        // проверяем ответ после отправки письма и обновляем данные в базе по повторной отправке
        // письма
        if (resend.accepted.length > 0) await usersRepository.updateSendingConfirmEmail(id, newConfirmationCode, newExpirationDate);
        return true;
    },

    async userLogin(userId: string, ip: string, title: string): Promise<UserTokensPairInterface | null> {
        console.log(`[authService]/userLogin  started`);
        const deviceId = new ObjectId().toString();
        const accessToken = await jwtService.createAccessJWT(userId);
        const refreshToken = await jwtService.createRefreshJWT(userId, deviceId, ip);
        const {lastActiveDate, expiresDate} = jwtService.getSessionInfoByJwtToken(refreshToken);
        await authSessionsRepository.saveDeviceAuthSession({
            deviceId,
            ip,
            title,
            userId,
            lastActiveDate,
            expiresDate
        });
        return {accessToken, refreshToken};
    },
    async userRefreshTokens(userId: string, deviceId: string, ip: string, title: string): Promise<UserTokensPairInterface | null> {
        console.log(`[authService]/userRefresh  started`);
        const accessToken = await jwtService.createAccessJWT(userId);
        const refreshToken = await jwtService.createRefreshJWT(userId, deviceId, ip);
        const {lastActiveDate, expiresDate} = jwtService.getSessionInfoByJwtToken(refreshToken);
        const result = await authSessionsRepository.updateDeviceAuthSession({
            deviceId,
            ip,
            title,
            userId,
            lastActiveDate,
            expiresDate
        });
        if (!result) return null;
        return {accessToken, refreshToken};
    },
    async userLogout(refreshToken: string): Promise<boolean> {
        const userInfo = await jwtService.getSessionInfoByJwtToken(refreshToken);
        console.log(`[authService]: userLogout`);
        if (!userInfo) return false;
        return authSessionsRepository.deleteSessionById(userInfo.deviceId);
    },
    async checkDeviceSession(deviceId: string, userId: string, lastActiveDate: string): Promise<{ status: string, message: string }> {
        console.log(`[authService] checkDeviceSession run...`);
        const sessionInDb = await authSessionsRepository.getDeviceAuthSessionByDeviceId(deviceId);
        if (!sessionInDb) return {status: 'error', message: 'sessionInDb not find'};
        console.log(`[authService] checkDeviceSession: sessionInDb.lastActiveDate:${sessionInDb.lastActiveDate}`);
        console.log(`[authService] checkDeviceSession: sessionInTOKEN.lastActiveDate:${lastActiveDate}`);
        console.log(`[authService] checkDeviceSession: RESULT:${lastActiveDate === sessionInDb.lastActiveDate}`);

        if (sessionInDb.lastActiveDate !== lastActiveDate) return {status: 'error', message: 'lastActiveDate is wrong'};
        if (sessionInDb.userId !== userId) return {status: 'error', message: 'userId is wrong'};
        return {status: 'ok', message: 'ok'};
    },
    async getAllSessionByUserId(userId: string): Promise<DeviceSessionViewModelDto[]> {
        const sessions = await authSessionsRepository.getAllSessionByUserId(userId);
        return sessions.map(s => ({
            ip: s.ip,
            title: s.title,
            lastActiveDate: new Date(+s.lastActiveDate).toISOString(),
            deviceId: s.deviceId
        }));
    },
    async getAuthSessionById(deviceId: string): Promise<AuthSessionInDb | null> {
        return await authSessionsRepository.getDeviceAuthSessionByDeviceId(deviceId);
    },
    async deleteAllSessionExcludeCurrent(refreshToken: string): Promise<boolean> {
        console.log(`[authService]/deleteAllSessionExcludeCurrent started`);
        const userInfoFromToken = await jwtService.getSessionInfoByJwtToken(refreshToken);
        console.log(`[authService]/deleteAllSessionExcludeCurrent deviceId:${userInfoFromToken?.deviceId}`);

        if (!userInfoFromToken) return false;
        const sessionInDb = await authSessionsRepository.getDeviceAuthSessionByDeviceId(userInfoFromToken.deviceId);
        console.log(`[authService]/deleteAllSessionExcludeCurrent userId:${sessionInDb?.userId}`);

        if (!sessionInDb) return false;
        return await authSessionsRepository.deleteSessionExcludeId(sessionInDb.deviceId, sessionInDb.userId);
    },
    async deleteSessionById(deviceId: string): Promise<boolean> {
        return await authSessionsRepository.deleteSessionById(deviceId);
    }
};
