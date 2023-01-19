import {Response, Request} from "express";
import {RequestWithBody} from "../types/request.type";
import {LoginInputModel} from "./dto/inputModels/loginInputModel.dto";
import {UsersService} from "../services/users.service";
import {UserInputModelDto} from "./dto/inputModels/userInputModel.dto";
import {RegistrationEmailResendingInputModelDto} from "./dto/inputModels/registrationEmailResendingInputModel.dto";
import {AuthService} from "../services/auth.service";
import {getDeviceInfo, setRefreshTokenToCookie} from "../helpers/helpers";
import {PasswordRecoveryInputModel} from './dto/inputModels/passwordRecoveryInputModel.dto';
import {NewPasswordRecoveryInputModel} from './dto/inputModels/newPasswordRecoveryInputModel.dto';
import {AuthControllerInterface} from './interfaces/auth-controller.interface';
import {inject, injectable} from 'inversify';
import {TYPES} from '../types/types';

@injectable()
export class AuthController implements AuthControllerInterface{
    constructor(
        @inject(TYPES.UsersService) protected usersService: UsersService,
        @inject(TYPES.AuthService) protected authService: AuthService
    ) {
    }

    async userLogin(req: RequestWithBody<LoginInputModel>, res: Response) {
        try {
            const {loginOrEmail, password} = req.body;
            console.log(`!!!![authRouter] login:${loginOrEmail}`);
            const userId = await this.authService.checkCredentials({loginOrEmail, password});
            if (!userId) return res.sendStatus(401);
            const {ip, title} = getDeviceInfo(req);
            const tokens = await this.authService.userLogin(userId, ip, title);
            if (!tokens) return res.sendStatus(503);
            setRefreshTokenToCookie(res, tokens.refreshToken);
            return res.status(200)
                .send({"accessToken": tokens.accessToken});
        } catch (error) {
            return res.sendStatus(500);
        }
    }

    async getAuthInfoForUser(req: RequestWithBody<LoginInputModel>, res: Response) {
        try {
            console.log(`[authController]/GET:auth/me started`);
            const userId = req.user!.id;
            console.log(`[authController]:get user info by ID: ${userId}`);
            const userInDb = await this.usersService.getUserById(userId);
            if (!userInDb) return res.sendStatus(401);
            return res.status(200).send({
                email: userInDb.email,
                login: userInDb.login,
                userId
            });
        } catch (error) {
            return res.sendStatus(500);
        }
    }

    async userRegistration(req: RequestWithBody<UserInputModelDto>, res: Response) {
        console.log(`[authController]:POST/registration run`);
        try {
            const {login, password, email} = req.body;
            const newUser = await this.usersService.createNewUser(login, email, password);
            if (newUser) return res.sendStatus(204);
        } catch (error) {
            return res.sendStatus(500);
        }
    }

    async registrationConfirmation(req: Request, res: Response) {
        console.log(`[authController]:POST/registration-confirmation run`);
        try {
            const code = String(req.body.code);
            const result = await this.authService.confirmEmail(code);
            if (!result) res.sendStatus(400);
            return res.sendStatus(204);

        } catch (error) {
            return res.sendStatus(500);
        }
    }

    async registrationEmailResending(req: RequestWithBody<RegistrationEmailResendingInputModelDto>, res: Response) {
        console.log(`[authController]:POST/registration-email-resending run`);
        try {
            const {email} = req.body;
            const user = await this.usersService.findUserByEmailOrLogin(email);
            const result = await this.authService.resendingEmail(user!.id);
            if (!result) return res.status(400).send(
                {"errorsMessages": [{"message": "can\'t send email", "field": "email"}]}
            );
            return res.sendStatus(204);
        } catch (error) {
            return res.sendStatus(500);
        }
    }

    async refreshToken(req: Request, res: Response) {
        console.log(`[authController]:POST/refresh-token run`);
        try {
            const {ip, title} = getDeviceInfo(req);
            const userId = req.user?.id;
            const deviceId = req.deviceId;
            const tokensPair = await this.authService.userRefreshTokens(userId!, deviceId!, ip, title);
            if (!tokensPair) return res.sendStatus(500);
            setRefreshTokenToCookie(res, tokensPair.refreshToken);
            return res.status(200).send({
                "accessToken": tokensPair.accessToken
            });
        } catch (error) {

            return res.sendStatus(500);
        }
    }

    async userLogout(req: Request, res: Response) {
        console.log(`[authController]:POST/logout run`);
        try {
            const inputRefreshToken = req.cookies.refreshToken;
            const result = await this.authService.userLogout(inputRefreshToken);
            if (!result) return res.sendStatus(500);
            res.clearCookie('refreshToken');
            return res.sendStatus(204);
        } catch (error) {
            return res.sendStatus(500);
        }
    }

    async passwordRecovery(req: RequestWithBody<PasswordRecoveryInputModel>, res: Response) {
        console.log(`[authController]:POST/password-recovery run`);
        try {
            const {email} = req.body;
            await this.authService.passwordRecovery(email);
            return res.sendStatus(204);
        } catch (error) {
            return res.sendStatus(500);
        }
    }

    async createNewPassword(req: RequestWithBody<NewPasswordRecoveryInputModel>, res: Response) {
        console.log(`[authController]:POST on https://{host}/auth/new-password init...`);
        try {
            const {newPassword, recoveryCode} = req.body;
            const result = await this.authService.confirmPasswordRecovery(newPassword, recoveryCode);
            if (result.code === 400) {
                return res.status(400).send({
                    errorsMessages: [
                        {
                            message: 'recoveryCode is wrong',
                            field: 'recoveryCode'
                        }]
                });
            }
            if (result.code === 500) return res.sendStatus(500);
            return res.sendStatus(204);
        } catch (error) {
            return res.sendStatus(500);
        }
    }
}
