import {UserViewModelDto} from "../controllers/dto/userViewModel.dto";

declare global{
    declare namespace Express{
        export interface Request {
            user: UserViewModelDto | null,
            deviceId: string| undefined
        }
    }
}