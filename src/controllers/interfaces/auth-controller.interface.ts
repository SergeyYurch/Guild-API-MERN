import {Response, Request} from "express";
import "reflect-metadata";
import {RequestWithBody} from '../../types/request.type';
import {LoginInputModel} from '../dto/inputModels/loginInputModel.dto';
import {RegistrationEmailResendingInputModelDto} from '../dto/inputModels/registrationEmailResendingInputModel.dto';
import {PasswordRecoveryInputModel} from '../dto/inputModels/passwordRecoveryInputModel.dto';
import {NewPasswordRecoveryInputModel} from '../dto/inputModels/newPasswordRecoveryInputModel.dto';

export interface AuthControllerInterface {
    userLogin(req: RequestWithBody<LoginInputModel>, res: Response): Promise<Response>;

    getAuthInfoForUser(req: RequestWithBody<LoginInputModel>, res: Response): Promise<Response>;

    registrationConfirmation(req: Request, res: Response): Promise<Response>;

    registrationEmailResending(req: RequestWithBody<RegistrationEmailResendingInputModelDto>, res: Response): Promise<Response>;

    refreshToken(req: Request, res: Response): Promise<Response>;

    userLogout(req: Request, res: Response): Promise<Response>;

    passwordRecovery(req: RequestWithBody<PasswordRecoveryInputModel>, res: Response): Promise<Response>;

    createNewPassword(req: RequestWithBody<NewPasswordRecoveryInputModel>, res: Response): Promise<Response>;
}