import {Schema} from 'mongoose';
import {UserEntity} from '../../services/entities/user.entity';

export const userSchema = new Schema<UserEntity>({
    accountData: {
        login: String,
        email: String,
        passwordHash: String,
        passwordSalt: String,
        createdAt: { type: Date, default: Date.now }
    },
    emailConfirmation: {
        confirmationCode: String,
        expirationDate: Date,
        isConfirmed: Boolean,
        dateSendingConfirmEmail: [Date]
    },
    passwordRecoveryInformation: {
        type:{
            recoveryCode: String,
            expirationDate: Date
        },
        default:null}
});