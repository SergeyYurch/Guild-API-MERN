import nodemailer from 'nodemailer';
import * as dotenv from "dotenv";

dotenv.config();

export const emailAdapter = {
    async sendEmail(email: string, subject: string, message: string) {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER || 'sergyurch18@gmail.com',
                pass: process.env.SMTP_PASS || 'zrhnhvwhmvhjikec'
            },
            tls: {rejectUnauthorized: false}
        });
        const info = await transport.sendMail({
            from: `Blogs Plaform<${process.env.SMTP_USER}>`,
            to: email,
            subject: subject,
            html: message
        });
        console.log(info);
        return info;
    }
};