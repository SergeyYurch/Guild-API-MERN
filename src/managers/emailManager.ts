import {emailAdapter} from "../adapters/emailAdapter";
import * as dotenv from "dotenv";
dotenv.config()

export const emailManager = {
    async sendEmailConfirmation (email:string, confirmationCode:string){
        console.log(`emailManager]:sendEmailConfirmation to ${email}`);
        const subject = 'email confirm'
        const app_host = process.env.APP_HOST || 'http://localhost:5001'
        const message = `<a href="${app_host}/auth/registration-confirmation\?code=${confirmationCode}">Confirm email</a>`
        return await emailAdapter.sendEmail(email, subject, message)
    }
}
