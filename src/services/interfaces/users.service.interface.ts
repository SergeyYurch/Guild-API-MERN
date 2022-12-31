import {UserViewModelDto} from "../../controllers/dto/userViewModel.dto";
import {LoginInputModel} from "../../controllers/dto/loginInputModel.dto";

export interface UsersServiceInterface {
    registerNewUser: (login: string, email: string, password: string) => Promise<UserViewModelDto | null>;
    createNewUser: (login: string, email: string, password: string) => Promise<UserViewModelDto | null>;
    deleteUserById: (id: string) => Promise<boolean>;
    findUserByEmailOrLogin: (loginOrEmail: string) => Promise<UserViewModelDto | null>;
    getUserById: (id: string) => Promise<UserViewModelDto | null>;
    checkCredentials: (credentials: LoginInputModel) => Promise<UserViewModelDto | null>;
    confirmEmail: (code: string) => Promise<boolean>;
    resendingEmail: (id: string) => Promise<boolean>;
    findCorrectConfirmationCode:(code: string)=> Promise<boolean>
    checkTokenInBlackList:(refreshToken:string)=>Promise<boolean>
    saveTokenToBlackList:(refreshToken:string)=>Promise<boolean>
}
