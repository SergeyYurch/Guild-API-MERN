import request from 'supertest';
import 'reflect-metadata';

import {jwtService} from "../src/utils/jwt-service";
import {UserEntityWithIdInterface} from '../src/repositories/repository-interfaces/user-entity-with-id.interface';
import {UserViewModelDto} from '../src/controllers/dto/viewModels/userViewModel.dto';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import {delay} from '../src/helpers/helpers';
import {queryRepository, usersService} from '../src/composition-root/compositiomRoot';
import {App} from '../src/app';
import {applicationBoot} from '../src';

let application: App;

dotenv.config();
const mongoUri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

const user1 = {
    login: "user1",
    password: "password1",
    email: "email1@gmail.com"
};
const user2 = {
    login: "user2",
    password: "password2",
    email: "email2@gmail.com"
};

const blog1 = {
    name: 'blog1',
    description: "description1",
    websiteUrl: 'https://youtube1.com'
};

describe('Testing route: [HOST]/auth/', () => {
    let user1Id = '';
    let userRId = '';
    let user2Id = '';
    let blog1Id = '';
    let post1Id = '';
    let cookies = [];
    let refreshToken = '';
    let expiredRefreshToken = '';
    let accessToken = '';
    let confirmationCode = '';
    let recoveryCode = '';
    let userR: UserViewModelDto | null;
    let userInDb: UserEntityWithIdInterface | null;
    let userRInDb: UserEntityWithIdInterface | null;


    beforeAll(async () => {
        //start app
        const server = await applicationBoot;
        application = server.app;
        await mongoose.connect(mongoUri + '/' + dbName + '?retryWrites=true&w=majority');

        //Cleaning dataBase
        await request(application.app)
            .delete('/testing/all-data');

        //created new users
        const newUser1 = await request(application.app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user1)
            .expect(201);


        const newUser2 = await request(application.app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user2)
            .expect(201);

        //created new blog
        const newBlog1 = await request(application.app)
            .post('/blogs')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(blog1);


        //created new post
        const newPost1 = await request(application.app)
            .post('/posts')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                title: 'post1',
                shortDescription: 'shortDescription1',
                content: 'content1',
                blogId: newBlog1.body.id
            });
        blog1Id = newBlog1.body.id;
        user1Id = newUser1.body.id;
        user2Id = newUser2.body.id;
        post1Id = newPost1.body.id;
        userInDb = await queryRepository.getUserById(user1Id);
        confirmationCode = userInDb!.emailConfirmation.confirmationCode;
    });

    afterAll(async () => {
        //close app
        application.close();
        await mongoose.connection.close();
    });


    it('POST:[HOST]/auth/registration: should return code 400 If the inputModel has incorrect values',
        async () => {
            await request(application.app)
                .post('/auth/registration')
                .send({
                    "email": "string",
                    "password": "password1"
                })
                .expect(400);
        });

    it('POST:[HOST]/auth/registration: should return code 204 if input model is correct',
        async () => {
            await request(application.app)
                .post('/auth/registration')
                .send({
                    "login": "user15",
                    "password": "string111",
                    "email": "user15@mail.ru"
                })
                .expect(204);
        });

    it('POST:[HOST]/auth/registration: should return code 429 if access attempt limit exceeded',
        async () => {
            await delay(10000);
            await request(application.app)
                .post('/auth/registration')
                .send({
                    "login": "user11",
                    "password": "string11",
                    "email": "user11@mail.ru"
                });

            await request(application.app)
                .post('/auth/registration')
                .send({
                    "login": "user2",
                    "password": "string2",
                    "email": "user2@mail.ru"
                });
            await request(application.app)
                .post('/auth/registration')
                .send({
                    "login": "user11",
                    "password": "string11",
                    "email": "user11@mail.ru"
                });

            await request(application.app)
                .post('/auth/registration')
                .send({
                    "login": "user2",
                    "password": "string2",
                    "email": "user2@mail.ru"
                });


            await request(application.app)
                .post('/auth/registration')
                .send({
                    "login": "user3",
                    "password": "string3",
                    "email": "user3@mail.ru"
                });

            await request(application.app)
                .post('/auth/registration')
                .send({
                    "login": "user6",
                    "password": "string6",
                    "email": "user6@mail.ru"
                })
                .expect(429);
        });

    it('POST:[HOST]/auth/login: should return code 400 If the inputModel has incorrect values',
        async () => {
            await request(application.app)
                .post('/auth/login')
                .send({
                    "password": "password1"
                })
                .expect(400);
        });

    it('POST:[HOST]/auth/login: should return code 401 if the password or login is wrong',
        async () => {
            await request(application.app)
                .post('/auth/login')
                .send({
                    "loginOrEmail": "wwwwwwwwwwww",
                    "password": "password1"
                })
                .expect(401);
        });

    it('POST:[HOST]/auth/login: should return code 200 and pair of JWT-tokens',
        async () => {
            const result = await request(application.app)
                .post('/auth/login')
                .set('X-Forwarded-For', `1.2.3.4`)
                .set('User-Agent', `android`)
                .send({
                    "loginOrEmail": "user1",
                    "password": "password1"
                })
                .expect(200);

            cookies = result.get('Set-Cookie');
            refreshToken = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';
            const userIdFromRefreshToken = await jwtService.getUserIdByJwtToken(refreshToken, 'refresh');
            expect(userIdFromRefreshToken).toBe(user1Id);

            accessToken = result.body.accessToken;
            const idFromToken = await jwtService.getUserIdByJwtToken(accessToken, 'access');
            expect(idFromToken).toBe(user1Id);
        });

    it('POST:[HOST]/auth/login: should return code 429 to more than 5 attempts from one IP-address during 10 seconds',
        async () => {
            await delay(10000);
            await request(application.app)
                .post('/auth/login')
                .send({
                    "loginOrEmail": "user111",
                    "password": "password111"
                });
            await request(application.app)
                .post('/auth/login')
                .send({
                    "loginOrEmail": "user111",
                    "password": "password111"
                });
            await request(application.app)
                .post('/auth/login')
                .send({
                    "loginOrEmail": "user111",
                    "password": "password111"
                });
            await request(application.app)
                .post('/auth/login')
                .send({
                    "loginOrEmail": "user111",
                    "password": "password111"
                });
            await request(application.app)
                .post('/auth/login')
                .send({
                    "loginOrEmail": "user111",
                    "password": "password111"
                });

            await request(application.app)
                .post('/auth/login')
                .send({
                    "loginOrEmail": "user1",
                    "password": "password1"
                })
                .expect(429);


        });

    it('POST:[HOST]/auth/refresh-token: should return code 401 no refreshToken',
        async () => {
            await request(application.app)
                .post('/auth/refresh-token')
                .set('X-Forwarded-For', `1.2.3.4`)
                .set('User-Agent', `android`)
                .expect(401);
        });

    it('POST:[HOST]/auth/refresh-token: should return code 200 and pair of JWT-tokens',
        async () => {
            const result = await request(application.app)
                .post('/auth/refresh-token')
                .set('Cookie', `refreshToken=${refreshToken}`)
                .set('X-Forwarded-For', `1.2.3.4`)
                .set('User-Agent', `android`)
                .expect(200);

            const cookies = result.get('Set-Cookie');
            refreshToken = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';
            console.log('refreshToken');

            console.log(refreshToken);
            const userIdFromRefreshToken = await jwtService.getUserIdByJwtToken(refreshToken, 'refresh');
            expect(userIdFromRefreshToken).toBe(user1Id);

            const accessToken = result.body.accessToken;
            const idFromToken = await jwtService.getUserIdByJwtToken(accessToken, 'access');
            expect(idFromToken).toBe(user1Id);
        });

    it('POST:[HOST]/auth/refresh-token: should return code 401 with expired refreshToken',
        async () => {
            let loginResult = await request(application.app)
                .post('/auth/refresh-token')
                .set('Cookie', `refreshToken=${refreshToken}`)
                .set('X-Forwarded-For', `1.2.3.4`)
                .set('User-Agent', `android`)
                .expect(200);

            let cookies = loginResult.get('Set-Cookie');
            refreshToken = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';
            const sessionInfo = await jwtService.getSessionInfoByJwtToken(refreshToken);
            const deviceId1 = sessionInfo!.deviceId;
            expiredRefreshToken = await jwtService.createExpiredRefreshJWT(user1Id, deviceId1, '1.2.3.1')

            loginResult = await request(application.app)
                .post('/auth/refresh-token')
                .set('Cookie', `refreshToken=${refreshToken}`)
                .set('X-Forwarded-For', `1.2.3.4`)
                .set('User-Agent', `android`)
                .expect(200);

            cookies = loginResult.get('Set-Cookie');
            refreshToken = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';


            await request(application.app)
                .post('/auth/refresh-token')
                .set('Cookie', `refreshToken=${expiredRefreshToken}`)
                .set('X-Forwarded-For', `1.2.3.4`)
                .set('User-Agent', `android`)
                .expect(401);
        });

    it('POST:[HOST]/auth/registration-confirmation: should return code 400 If the confirmation code is incorrect, expired or already been applied',
        async () => {
            await request(application.app)
                .post('/auth/registration-confirmation')
                .send({
                    "code": "fake"
                })
                .expect(400);
        });

    it('POST:[HOST]/auth/registration-confirmation: should return code 400 If the confirmation code is incorrect',
        async () => {
            await request(application.app)
                .post('/auth/registration-confirmation')
                .send({
                    "code": "fake"
                })
                .expect(400);
        });

    it('POST:[HOST]/auth/registration-confirmation: should return code 204 If the confirmation code is correct',
        async () => {
            const newUserR = await request(application.app)
                .post('/auth/registration')
                .send({
                    login: "userR",
                    password: "passwordR",
                    email: "emailR@gmail.com"
                });

            userR = await usersService.findUserByEmailOrLogin('userR');
            userRId = userR!.id;
            userRInDb = await queryRepository.getUserById(userRId);
            confirmationCode = userRInDb!.emailConfirmation.confirmationCode;


            await request(application.app)
                .post('/auth/registration-confirmation')
                .send({
                    "code": confirmationCode
                })
                .expect(204);
        });

    it('POST:[HOST]/auth/registration-confirmation: should return code 400 If the confirmation code is already been applied',
        async () => {
            await request(application.app)
                .post('/auth/registration-confirmation')
                .send({
                    "code": confirmationCode
                })
                .expect(400);
        });

    it('POST:[HOST]/auth/registration-email-resending: should return code 400 If email is incorrect',
        async () => {
            await request(application.app)
                .post('/auth/registration-email-resending')
                .send({
                    "email": "fake@gmail.com"
                })
                .expect(400);
        });

    it('POST:[HOST]/auth/registration-email-resending: should return code 204 If the email is correct',
        async () => {
            await request(application.app)
                .post('/auth/registration')
                .send({
                    login: "userE",
                    password: "passwordE",
                    email: "emailE@gmail.com"
                });


            await request(application.app)
                .post('/auth/registration-email-resending')
                .send({
                    "email": "emailE@gmail.com"
                })
                .expect(204);
        });

    it('POST:[HOST]/auth/logout: should return code 401 no refreshToken',
        async () => {
            await request(application.app)
                .post('/auth/logout')
                .expect(401);
        });

    it('POST:[HOST]/auth/logout:should return code 204 and logout and return code 401 if user send correct refreshToken after logout',
        async () => {
            const result = await request(application.app)
                .post('/auth/logout')
                .set('Cookie', `refreshToken=${refreshToken}`)
                .expect(204);

            await request(application.app)
                .post('/auth/logout')
                .set('Cookie', `refreshToken=${refreshToken}`)
                .expect(401);

        });

    it('POST:[HOST]/auth/password-recovery: should return code 400 If email is incorrect',
        async () => {
            await request(application.app)
                .post('/auth/password-recovery')
                .send({
                    "email": "fake^^gmail.com"
                })
                .expect(400);
        });

    it('POST:[HOST]/auth/password-recovery: should return code 204 If the email is correct',
        async () => {
            await request(application.app)
                .post('/auth/password-recovery')
                .send({
                    "email": "email1@gmail.com"
                })
                .expect(204);
            userInDb = await queryRepository.getUserById(user1Id);
            recoveryCode = userInDb!.passwordRecoveryInformation!.recoveryCode;
        });

    it('POST:[HOST]/auth/password-recovery: should return code 204 If the email is correct but email is not in dataBase',
        async () => {
            await request(application.app)
                .post('/auth/password-recovery')
                .send({
                    "email": "email1111@gmail.com"
                })
                .expect(204);
        });

    it('POST:[HOST]/auth/new-password: should return code 400 If the inputModel is incorrect',
        async () => {
            await request(application.app)
                .post('/auth/new-password')
                .send({
                    "newPassword": "string"
                })
                .expect(400);
        });

    it('POST:[HOST]/auth/new-password: should return code 400 If the inputModel has incorrect value (for incorrect password length) ',
        async () => {
            await request(application.app)
                .post('/auth/new-password')
                .send({
                    "newPassword": "st",
                    "recoveryCode": recoveryCode
                })
                .expect(400);
        });

    it('POST:[HOST]/auth/new-password: should return code 400 If  RecoveryCode is incorrect',
        async () => {
            await request(application.app)
                .post('/auth/new-password')
                .send({
                    "newPassword": "string",
                    "recoveryCode": "recoveryCode"
                })
                .expect(400);
        });

    // it('POST:[HOST]/auth/new-password: should return code 400 If RecoveryCode is expired',
    //     async () => {
    //         await delay(12000);
    //
    //         await request(application.app)
    //             .post('/auth/new-password')
    //             .send({
    //                 "newPassword": "st",
    //                 "recoveryCode": recoveryCode
    //             })
    //             .expect(400);
    //     });

    it('POST:[HOST]/auth/new-password: should return code 204 If code is valid and new password is accepted',
        async () => {
            // await request(application.app)
            //     .post('/auth/password-recovery')
            //     .send({
            //         "email": "email1@gmail.com"
            //     });
            //
            // userInDb = await queryRepository.getUserById(user1Id);
            // recoveryCode = userInDb!.passwordRecoveryInformation!.recoveryCode;

            await request(application.app)
                .post('/auth/new-password')
                .send({
                    "newPassword": "newPassword",
                    "recoveryCode": recoveryCode
                })
                .expect(204);


        });

    it('POST:[HOST]/auth/new-password: should return code 200 when user connect with new password',
        async () => {
        const result = await request(application.app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "user1",
                "password": "newPassword"
            })
            .expect(200);
    });

    it('POST:[HOST]/auth/new-password: should return code 401 when user connect with old password',
        async () => {
        const result = await request(application.app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            })
            .expect(401);

    });

});
