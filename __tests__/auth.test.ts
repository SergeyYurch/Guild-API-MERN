import request from 'supertest';
import {app} from "../src/app";
import {jwtService} from "../src/utils/jwt-service";
import {UserEntityWithIdInterface} from '../src/repositories/repository-interfaces/user-entity-with-id.interface';
import {UsersService} from '../src/services/users.service';
import {UserViewModelDto} from '../src/controllers/dto/userViewModel.dto';
import {QueryRepository} from '../src/repositories/query.repository';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import {delay} from '../src/helpers/helpers';

const usersService = new UsersService()
const queryRepository = new QueryRepository()

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

describe('HOST/auth/registration :login user and receiving token, getting info about user', () => {
    let user1Id = '';
    let user2Id = '';
    let blog1Id = '';
    let post1Id = '';

    beforeAll(async () => {
        //Cleaning dataBase
        await mongoose.connect(mongoUri + '/' + dbName + '?retryWrites=true&w=majority');
        await request(app)
            .delete('/testing/all-data');
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });


    it('should return code 400 If the inputModel has incorrect values', async () => {
        await request(app)
            .post('/auth/registration')
            .send({
                "email": "string",
                "password": "password1"
            })
            .expect(400);
    });

    it('should return code 204 if input model is correct', async () => {
        await request(app)
            .post('/auth/registration')
            .send({
                "login": "user1",
                "password": "string111",
                "email": "user1@mail.ru"
            })
            .expect(204);
    });

    it('should return code 429 if access attempt limit exceeded', async () => {
        await request(app)
            .post('/auth/registration')
            .send({
                "login": "user11",
                "password": "string11",
                "email": "user11@mail.ru"
            })
            .expect(204);

        await request(app)
            .post('/auth/registration')
            .send({
                "login": "user2",
                "password": "string2",
                "email": "user2@mail.ru"
            })
            .expect(204);

        await request(app)
            .post('/auth/registration')
            .send({
                "login": "user3",
                "password": "string3",
                "email": "user3@mail.ru"
            })
            .expect(204);

        await request(app)
            .post('/auth/registration')
            .send({
                "login": "user6",
                "password": "string6",
                "email": "user6@mail.ru"
            })
            .expect(429);
    });
});
describe('HOST/auth/login :login user and receiving token, getting info about user', () => {
    let user1Id = '';
    let user2Id = '';
    let blog1Id = '';
    let post1Id = '';

    beforeAll(async () => {
        //cleaning dataBase
        await mongoose.connect(mongoUri + '/' + dbName + '?retryWrites=true&w=majority');
        await request(app)
            .delete('/testing/all-data');
        //created new users
        const newUser1 = await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user1)
            .expect(201);


        const newUser2 = await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user2)
            .expect(201);

        //created new blog
        const newBlog1 = await request(app)
            .post('/blogs')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(blog1);


        //created new post
        const newPost1 = await request(app)
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
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });
    it('should return code 400 If the inputModel has incorrect values', async () => {
        await request(app)
            .post('/auth/login')
            .send({
                "password": "password1"
            })
            .expect(400);
    });

    it('should return code 401 if the password or login is wrong', async () => {
        await request(app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "wwwwwwwwwwww",
                "password": "password1"
            })
            .expect(401);
    });

    it('should return code 200 and pair of JWT-tokens', async () => {
        const result = await request(app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            })
            .expect(200);

        const cookies = result.get('Set-Cookie');
        const refreshToken = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';
        const userIdFromRefreshToken = await jwtService.getUserIdByJwtToken(refreshToken, 'refresh');
        expect(userIdFromRefreshToken).toBe(user1Id);

        const accessToken = result.body.accessToken;
        const idFromToken = await jwtService.getUserIdByJwtToken(accessToken, 'access');
        expect(idFromToken).toBe(user1Id);
    });

    it('should return code 429 to more than 5 attempts from one IP-address during 10 seconds', async () => {
        await request(app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            })
            .expect(200);
        await request(app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            })
            .expect(200);

        await request(app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            })
            .expect(429);


    });
});
describe('HOST/auth/refresh-token ', () => {
    let user1Id = '';
    let accessToken = '';
    let refreshToken = '';
    let expiredRefreshToken = '';
    let user2RefreshToken = '';

    beforeAll(async () => {
        //cleaning dataBase
        await mongoose.connect(mongoUri + '/' + dbName + '?retryWrites=true&w=majority');
        await request(app)
            .delete('/testing/all-data');
        //created new users

        const newUser1 = await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user1);

        //login user
        const loginResult = await request(app)
            .post('/auth/login')
            .set('X-Forwarded-For', `1.2.3.4`)
            .set('User-Agent', `android`)
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            });

        const cookies = loginResult.get('Set-Cookie');
        refreshToken = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';
        expiredRefreshToken = refreshToken;
        user1Id = newUser1.body.id;
        const sessionInfo = await jwtService.getSessionInfoByJwtToken(refreshToken);

    });
    afterAll(async () => {
        await mongoose.connection.close();
    });
    it('should return code 401 no refreshToken', async () => {
        await request(app)
            .post('/auth/refresh-token')
            .set('X-Forwarded-For', `1.2.3.4`)
            .set('User-Agent', `android`)
            .expect(401);
    });


    it('should return code 200 and pair of JWT-tokens', async () => {
        const result = await request(app)
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

    it('should return code 401 with expired refreshToken', async () => {
        let loginResult = await request(app)
            .post('/auth/refresh-token')
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set('X-Forwarded-For', `1.2.3.4`)
            .set('User-Agent', `android`)
            .expect(200);

        let cookies = loginResult.get('Set-Cookie');
        refreshToken = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';
        expiredRefreshToken = refreshToken;

        loginResult = await request(app)
            .post('/auth/refresh-token')
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set('X-Forwarded-For', `1.2.3.4`)
            .set('User-Agent', `android`)
            .expect(200);

        cookies = loginResult.get('Set-Cookie');
        refreshToken = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';


        await request(app)
            .post('/auth/refresh-token')
            .set('Cookie', `refreshToken=${expiredRefreshToken}`)
            .set('X-Forwarded-For', `1.2.3.4`)
            .set('User-Agent', `android`)
            .expect(401);
    });

    it('should return code 429 to more than 5 attempts from one IP-address during 10 seconds', async () => {
        //
        // let loginResult = await request(app)
        //     .post('/auth/refresh-token')
        //     .set('Cookie', `refreshToken=${refreshToken}`)
        //     .set('X-Forwarded-For', `1.2.3.4`)
        //     .set('User-Agent', `android`)
        //     .expect(200);
        //
        // let cookies = loginResult.get('Set-Cookie');
        // refreshToken = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';
        //
        // loginResult = await request(app)
        //     .post('/auth/refresh-token')
        //     .set('Cookie', `refreshToken=${refreshToken}`)
        //     .set('X-Forwarded-For', `1.2.3.4`)
        //     .set('User-Agent', `android`)
        //     .expect(200);
        //
        // cookies = loginResult.get('Set-Cookie');
        // refreshToken = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';

        await request(app)
            .post('/auth/refresh-token')
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set('X-Forwarded-For', `1.2.3.4`)
            .set('User-Agent', `android`)
            .expect(429);


    });
});
describe('HOST/auth/registration-confirmation ', () => {
    let user1Id = '';
    let accessToken = '';
    let refreshToken = '';
    let expiredRefreshToken = '';
    let user2RefreshToken = '';
    let confirmationCode = '';
    let user: UserViewModelDto | null;
    let userInDb: UserEntityWithIdInterface | null;

    beforeAll(async () => {
        //cleaning dataBase
        await mongoose.connect(mongoUri + '/' + dbName + '?retryWrites=true&w=majority');
        await request(app)
            .delete('/testing/all-data');
        //created new users

        const newUser1 = await request(app)
            .post('/auth/registration')
            .send(user1);

        user = await usersService.findUserByEmailOrLogin('user1');
        user1Id = user!.id;
        userInDb = await queryRepository.getUserById(user1Id);
        confirmationCode = userInDb!.emailConfirmation.confirmationCode;
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });
    it('should return code 400 If the confirmation code is incorrect, expired or already been applied',
        async () => {
            await request(app)
                .post('/auth/registration-confirmation')
                .send({
                    "code": "fake"
                })
                .expect(400);
        });

    it('should return code 400 If the confirmation code is incorrect',
        async () => {
            await request(app)
                .post('/auth/registration-confirmation')
                .send({
                    "code": "fake"
                })
                .expect(400);
        });

    it('should return code 204 If the confirmation code is correct',
        async () => {
            await request(app)
                .post('/auth/registration-confirmation')
                .send({
                    "code": confirmationCode
                })
                .expect(204);
        });


    it('should return code 400 If the confirmation code is already been applied',
        async () => {
            await request(app)
                .post('/auth/registration-confirmation')
                .send({
                    "code": confirmationCode
                })
                .expect(400);
        });

    it('should return code 429 to more than 5 attempts from one IP-address during 10 seconds', async () => {

        await request(app)
            .post('/auth/registration-confirmation')
            .set('Cookie', `refreshToken=${refreshToken}`);

        await request(app)
            .post('/auth/registration-confirmation')
            .set('Cookie', `refreshToken=${refreshToken}`)
            .expect(429);
    });
});
describe('HOST/auth/registration-email-resending', () => {
    let user1Id = '';
    let accessToken = '';
    let refreshToken = '';
    let expiredRefreshToken = '';
    let user2RefreshToken = '';
    let confirmationCode = '';
    let user: UserViewModelDto | null;
    let userInDb: UserEntityWithIdInterface | null;

    beforeAll(async () => {
        //cleaning dataBase
        await mongoose.connect(mongoUri + '/' + dbName + '?retryWrites=true&w=majority');
        await request(app)
            .delete('/testing/all-data');
        //created new users

        const newUser1 = await request(app)
            .post('/auth/registration')
            .send(user1);

        user = await usersService.findUserByEmailOrLogin('user1');
        user1Id = user!.id;
        userInDb = await queryRepository.getUserById(user1Id);
        confirmationCode = userInDb!.emailConfirmation.confirmationCode;
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });
    it('should return code 400 If email is incorrect',
        async () => {
            await request(app)
                .post('/auth/registration-email-resending')
                .send({
                    "email": "fake@gmail.com"
                })
                .expect(400);
        });
    it('should return code 204 If the email is correct',
        async () => {
            await request(app)
                .post('/auth/registration-email-resending')
                .send({
                    "email": "email1@gmail.com"
                })
                .expect(204);
        });

    it('should return code 429 to more than 5 attempts from one IP-address during 10 seconds', async () => {

        await request(app)
            .post('/auth/registration-email-resending')
            .send({
                "email": "email1@gmail.com"
            })
            .expect(204);
        await request(app)
            .post('/auth/registration-email-resending')
            .send({
                "email": "email1@gmail.com"
            })
            .expect(204);
        await request(app)
            .post('/auth/registration-email-resending')
            .send({
                "email": "email1@gmail.com"
            })
            .expect(204);

        await request(app)
            .post('/auth/registration-email-resending')
            .send({
                "email": "email1@gmail.com"
            })
            .expect(429);
    });
});
describe('HOST/auth/logout', () => {
    let user1Id = '';
    let accessToken = '';
    let refreshToken = '';
    let expiredRefreshToken = '';
    let user2RefreshToken = '';

    beforeAll(async () => {
        //cleaning dataBase
        await mongoose.connect(mongoUri + '/' + dbName + '?retryWrites=true&w=majority');
        await request(app)
            .delete('/testing/all-data');
        //created new users

        const newUser1 = await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user1)
            .expect(201);

        //login user
        const loginResult = await request(app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            });

        const cookies = loginResult.get('Set-Cookie');
        refreshToken = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';
        user1Id = newUser1.body.id;
        const sessionInfo = await jwtService.getSessionInfoByJwtToken(refreshToken);
        expiredRefreshToken = await jwtService.createRefreshJWT(user1Id, sessionInfo!.deviceId, String(new Date().getTime() - 10000));

    });
    afterAll(async () => {
        await mongoose.connection.close();
    });
    it('should return code 401 no refreshToken', async () => {
        await request(app)
            .post('/auth/logout')
            .expect(401);
    });

    it('should return code 204 and logout and return code 401 if user send correct refreshToken after logout', async () => {
        const result = await request(app)
            .post('/auth/logout')
            .set('Cookie', `refreshToken=${refreshToken}`)
            .expect(204);

        await request(app)
            .post('/auth/logout')
            .set('Cookie', `refreshToken=${refreshToken}`)
            .expect(401);

    });

});
describe('HOST/auth/me', () => {
    let user1Id = '';
    let accessToken = '';
    let refreshToken = '';
    let expiredRefreshToken = '';
    let user2RefreshToken = '';

    beforeAll(async () => {
        //cleaning dataBase
        await mongoose.connect(mongoUri + '/' + dbName + '?retryWrites=true&w=majority');
        await request(app)
            .delete('/testing/all-data');
        //created new users

        const newUser1 = await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user1)
            .expect(201);

        //login user
        const loginResult = await request(app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            });

        accessToken = loginResult.body.accessToken;
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });
    it('should return code 401 no accessToken', async () => {
        await request(app)
            .get('/auth/me')
            .expect(401);
    });
    it('should return code 200 with correct accessToken', async () => {
        await request(app)
            .get('/auth/me')
            .auth(accessToken, {type: 'bearer'})
            .expect(200);
    });


});
describe('HOST/auth/password-recovery', () => {
    let user1Id = '';
    let accessToken = '';
    let refreshToken = '';
    let expiredRefreshToken = '';
    let user2RefreshToken = '';
    let confirmationCode = '';
    let user: UserViewModelDto | null;
    let userInDb: UserEntityWithIdInterface | null;

    beforeAll(async () => {
        //cleaning dataBase
        await mongoose.connect(mongoUri + '/' + dbName + '?retryWrites=true&w=majority');
        await request(app)
            .delete('/testing/all-data');
        //created new users

        const newUser1 = await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user1);

        user = await usersService.findUserByEmailOrLogin('user1');
        user1Id = user!.id;
        userInDb = await queryRepository.getUserById(user1Id);
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });
    it('should return code 400 If email is incorrect',
        async () => {
            await request(app)
                .post('/auth/password-recovery')
                .send({
                    "email": "fake^^gmail.com"
                })
                .expect(400);
        });
    it('should return code 204 If the email is correct',
        async () => {
            await request(app)
                .post('/auth/password-recovery')
                .send({
                    "email": "email1@gmail.com"
                })
                .expect(204);
        });


    it('should return code 204 If the email is correct but email is not in dataBase',
        async () => {
            await request(app)
                .post('/auth/password-recovery')
                .send({
                    "email": "email1111@gmail.com"
                })
                .expect(204);
        });


    it('should return code 429 to more than 5 attempts from one IP-address during 10 seconds', async () => {

        await request(app)
            .post('/auth/password-recovery')
            .send({
                "email": "email1@gmail.com"
            });
        await request(app)
            .post('/auth/password-recovery')
            .send({
                "email": "email1@gmail.com"
            });

        await request(app)
            .post('/auth/password-recovery')
            .send({
                "email": "email1@gmail.com"
            })
            .expect(429);
    });
});
describe('HOST/auth/new-password', () => {
    let user1Id = '';
    let accessToken = '';
    let refreshToken = '';
    let expiredRefreshToken = '';
    let user2RefreshToken = '';
    let confirmationCode = '';
    let user: UserViewModelDto | null;
    let userInDb: UserEntityWithIdInterface | null;
    let recoveryCode = '';

    beforeAll(async () => {
        //cleaning dataBase
        await mongoose.connect(mongoUri + '/' + dbName + '?retryWrites=true&w=majority');
        await request(app)
            .delete('/testing/all-data');
        //created new users

        const newUser1 = await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user1);
        //request new password
        await request(app)
            .post('/auth/password-recovery')
            .send({
                "email": "email1@gmail.com"
            });

        user = await usersService.findUserByEmailOrLogin('user1');
        user1Id = user!.id;
        userInDb = await queryRepository.getUserById(user1Id);
        recoveryCode = userInDb!.passwordRecoveryInformation!.recoveryCode;
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });
    it('should return code 400 If the inputModel is incorrect',
        async () => {
            await request(app)
                .post('/auth/new-password')
                .send({
                    "newPassword": "string"
                })
                .expect(400);
        });

    it('should return code 400 If the inputModel has incorrect value (for incorrect password length) ',
        async () => {
            await request(app)
                .post('/auth/new-password')
                .send({
                    "newPassword": "st",
                    "recoveryCode": recoveryCode
                })
                .expect(400);
        });

    it('should return code 400 If  RecoveryCode is incorrect',
        async () => {
            await request(app)
                .post('/auth/new-password')
                .send({
                    "newPassword": "string",
                    "recoveryCode": "recoveryCode"
                })
                .expect(400);
        });

    it('should return code 400 If RecoveryCode is expired',
        async () => {
            await delay(12000);

            await request(app)
                .post('/auth/new-password')
                .send({
                    "newPassword": "st",
                    "recoveryCode": recoveryCode
                })
                .expect(400);
        });


    it('should return code 204 If code is valid and new password is accepted',
        async () => {
            await request(app)
                .post('/auth/password-recovery')
                .send({
                    "email": "email1@gmail.com"
                });

            userInDb = await queryRepository.getUserById(user1Id);
            recoveryCode = userInDb!.passwordRecoveryInformation!.recoveryCode;

            await request(app)
                .post('/auth/new-password')
                .send({
                    "newPassword": "newPassword",
                    "recoveryCode": recoveryCode
                })
                .expect(204);


        });
    it('should return code 200 when user connect with new password', async () => {
        const result = await request(app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "user1",
                "password": "newPassword"
            })
            .expect(200);
    });
    it('should return code 401 when user connect with old password', async () => {
        const result = await request(app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            })
            .expect(401);

    });
    it('should return code 429 to more than 5 attempts from one IP-address during 10 seconds', async () => {
        await delay(10000);
        await request(app)
            .post('/auth/new-password')
            .send({
                "newPassword": "newPassword",
                "recoveryCode": recoveryCode
            });
        await request(app)
            .post('/auth/new-password')
            .send({
                "newPassword": "newPassword",
                "recoveryCode": recoveryCode
            });
        await request(app)
            .post('/auth/new-password')
            .send({
                "newPassword": "newPassword",
                "recoveryCode": recoveryCode
            });
        await request(app)
            .post('/auth/new-password')
            .send({
                "newPassword": "newPassword",
                "recoveryCode": recoveryCode
            });
        await request(app)
            .post('/auth/new-password')
            .send({
                "newPassword": "newPassword",
                "recoveryCode": recoveryCode
            });


        await request(app)
            .post('/auth/new-password')
            .send({
                "newPassword": "newPassword",
                "recoveryCode": recoveryCode
            })
            .expect(429);
    });
});
