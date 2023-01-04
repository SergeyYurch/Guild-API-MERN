import request from 'supertest';
import {app} from "../src/app";
import {jwtService} from "../src/utils/jwt-service";
import {usersRepository} from "../src/repositories/users.repository";
import {UserEntityWithIdInterface} from '../src/repositories/repository-interfaces/user-entity-with-id.interface';
import {usersService} from '../src/services/users.service';
import {UserViewModelDto} from '../src/controllers/dto/userViewModel.dto';
import {sub} from 'date-fns';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();
const mongoUri = process.env.MONGO_URI
const dbName = process.env.DB_NAME


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
describe('GET:HOST/security/devices', () => {
    let user1Id = '';
    let accessToken = '';
    let refreshToken = '';
    let expiredRefreshToken = '';
    let user2RefreshToken = '';

    beforeAll(async () => {
        //cleaning dataBase
        await mongoose.connect(mongoUri + '/' + dbName+'?retryWrites=true&w=majority');
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
            .set('X-Forwarded-For', `1.2.3.4`)
            .set('User-Agent', `android`)
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            });

        const cookies = loginResult.get('Set-Cookie');
        refreshToken = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';
        user1Id = newUser1.body.id;
        const sessionInfo = await jwtService.getSessionInfoByJwtToken(refreshToken);
        expiredRefreshToken = refreshToken
    });
    /* Closing database connection after each test. */
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should return code 401 no refreshToken', async () => {
        await request(app)
            .get('/security/devices')
            .set('X-Forwarded-For', `1.2.3.4`)
            .set('User-Agent', `android`)
            .expect(401);
    });

    it('should return code 200 when user connected on device1', async () => {
        await request(app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set('X-Forwarded-For', `1.2.3.4`)
            .set('User-Agent', `android`)
            .expect(200);
    });


});
describe('DELETE: HOST/security/devices', () => {
    let user1Id = '';
    let refreshToken1 = '';
    let refreshToken2 = '';
    let refreshToken3 = '';
    let expiredRefreshToken1 = '';

    beforeAll(async () => {
        //cleaning dataBase
        await mongoose.connect(mongoUri + '/' + dbName+'?retryWrites=true&w=majority');
        await request(app)
            .delete('/testing/all-data');
        //created new users

        const newUser1 = await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user1)
            .expect(201);

        //login user1 device1
        const loginResult1 = await request(app)
            .post('/auth/login')
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            });

        let cookies = loginResult1.get('Set-Cookie');
        refreshToken1 = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';
        user1Id = newUser1.body.id;
        const sessionInfo = await jwtService.getSessionInfoByJwtToken(refreshToken1);
        expiredRefreshToken1 = await jwtService.createRefreshJWT(user1Id, sessionInfo!.deviceId, String(sub(new Date().getTime(), {days: 2})));


        //login user1 device2
        const loginResult2 = await request(app)
            .post('/auth/login')
            .set('X-Forwarded-For', `1.2.3.2`)
            .set('User-Agent', `device2`)
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            });

        cookies = loginResult2.get('Set-Cookie');
        refreshToken2 = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';


        //login user1 device3
        const loginResult3 = await request(app)
            .post('/auth/login')
            .set('X-Forwarded-For', `1.2.3.3`)
            .set('User-Agent', `device3`)
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            });

        cookies = loginResult3.get('Set-Cookie');
        refreshToken3 = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should return code 200 when user connected on device1', async () => {
        await request(app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken1}`)
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .expect(200);
    });


    it('should return code 200 when user connected on device2', async () => {
        await request(app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken2}`)
            .set('X-Forwarded-For', `1.2.3.2`)
            .set('User-Agent', `device2`)
            .expect(200);
    });


    it('should return code 200 when user connected on device3', async () => {
        await request(app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken3}`)
            .set('X-Forwarded-For', `1.2.3.3`)
            .set('User-Agent', `device3`)
            .expect(200);
    });

    it('should return code 401 with expired refreshToken from device1', async () => {
        await request(app)
            .delete('/security/devices')
            .set('Cookie', `refreshToken=${expiredRefreshToken1}`)
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .expect(401);
    });

    it('should return code 204 and deleted session2 & session3 from device1', async () => {
        await request(app)
            .delete('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken1}`)
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .expect(204);
    });

    it('should return code 401 when user connected on device2', async () => {
        await request(app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken2}`)
            .set('X-Forwarded-For', `1.2.3.2`)
            .set('User-Agent', `device2`)
            .expect(401);
    });


    it('should return code 401 when user connected on device3', async () => {
        await request(app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken3}`)
            .set('X-Forwarded-For', `1.2.3.3`)
            .set('User-Agent', `device3`)
            .expect(401);
    });


});
describe('DELETE: HOST/security/devices/deviceId', () => {
    let user1Id = '';
    let user2Id = '';
    let refreshToken1 = '';
    let refreshToken2 = '';
    let refreshToken3 = '';
    let expiredRefreshToken1 = '';
    let deviceId1 = '';

    beforeAll(async () => {
        //cleaning dataBase
        await mongoose.connect(mongoUri + '/' + dbName+'?retryWrites=true&w=majority');
        await request(app)
            .delete('/testing/all-data');
        //created new users

        const newUser1 = await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user1);

        const newUser2 = await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user2);

        //login user1 device1
        const loginResult1 = await request(app)
            .post('/auth/login')
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            });

        //login user2 device1
        const loginResult2 = await request(app)
            .post('/auth/login')
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .send({
                "loginOrEmail": "user2",
                "password": "password2"
            });

        let cookies1 = loginResult1.get('Set-Cookie');
        refreshToken1 = cookies1[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';
        user1Id = newUser1.body.id;
        const sessionInfo = await jwtService.getSessionInfoByJwtToken(refreshToken1);
        deviceId1 = sessionInfo!.deviceId;
        expiredRefreshToken1 = await jwtService.createRefreshJWT(user1Id, sessionInfo!.deviceId, String(sub(new Date().getTime(), {days: 2})));


        let cookies2 = loginResult2.get('Set-Cookie');
        refreshToken2 = cookies2[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';
        user2Id = newUser2.body.id;
        const sessionInfo2 = await jwtService.getSessionInfoByJwtToken(refreshToken1);
        deviceId1 = sessionInfo2!.deviceId;
        expiredRefreshToken1 = await jwtService.createRefreshJWT(user1Id, sessionInfo2!.deviceId, String(sub(new Date().getTime(), {days: 2})));
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should return code 200 when user1 connected on device1', async () => {
        await request(app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken1}`)
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .expect(200);
    });

    it('should return code 200 when user2 connected on device1', async () => {
        await request(app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken2}`)
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .expect(200);
    });

    it('should return code 401 with expired refreshToken user1 from device1', async () => {
        await request(app)
            .delete(`/security/devices/${deviceId1}`)
            .set('Cookie', `refreshToken=${expiredRefreshToken1}`)
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .expect(401);
    });

    it('should return code 403 if try to delete the deviceId of other user', async () => {
        await request(app)
            .delete(`/security/devices/${deviceId1}`)
            .set('Cookie', `refreshToken=${refreshToken2}`)
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .expect(403);
    });


    it('should return code 404 if incorrect deviceId', async () => {
        await request(app)
            .delete(`/security/devices/63a88d39cab9d8769b178a12`)
            .set('Cookie', `refreshToken=${refreshToken1}`)
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .expect(404);
    });


    it('should return code 204 and deleted session1', async () => {
        await request(app)
            .delete(`/security/devices/${deviceId1}`)
            .set('Cookie', `refreshToken=${refreshToken1}`)
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .expect(204);
    });



    it('should return code 401 when user1 connected on device1 after deleted session', async () => {
        await request(app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken1}`)
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .expect(401);
    });


});