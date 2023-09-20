import {emailAdapter} from "../adapters/emailAdapter";
import * as dotenv from "dotenv";
dotenv.config()

export const emailManager = {
    async sendEmailConfirmation (email:string, confirmationCode:string){
        console.log(`emailManager]:sendEmailConfirmation to ${email}`);
        const subject = 'email confirm'
        const message = `<a href="http://some-url?code=${confirmationCode}">Confirm email</a>`
        return await emailAdapter.sendEmail(email, subject, message)
    },
    async sendEmailPasswordRecoveryConfirmation (email:string, confirmationCode:string){
        console.log(`emailManager]:sendEmailPasswordRecoveryConfirmation to ${email}`);
        const subject = 'Password recovery confirm'
        const message = ` <h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href="https://somesite.com/password-recovery?recoveryCode=${confirmationCode}">recovery password</a>
      </p>`
        return await emailAdapter.sendEmail(email, subject, message)
    }
}
