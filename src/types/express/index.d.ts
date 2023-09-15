import {UserViewModelDto} from "../../controllers/dto/viewModels/userViewModel.dto";

declare global{
    declare namespace Express{
        export interface Request {
            user: UserViewModelDto | null,
            deviceId: string| undefined
        }
    }
}