import request from 'supertest';
import {App} from "../src/app";
import {jwtService} from "../src/utils/jwt-service";
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import {applicationBoot} from '../src';
import {UserInfoInRefreshToken} from '../src/helpers/interfaces/user-info-in-refresh-token.interface';
import {delay} from '../src/helpers/helpers';

dotenv.config();
const mongoUri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

let application: App;


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

describe('Tests for: [HOST]/security/', () => {
    let cookies = [];
    let user1Id = '';
    let user2Id = '';

    let refreshToken1 = '';
    let refreshToken1_u2 = '';
    let refreshToken2 = '';
    let refreshToken3 = '';
    let refreshToken4 = '';
    let expiredRefreshToken1 = '';
    let expiredRefreshToken4 = '';
    let sessionInfo: UserInfoInRefreshToken;
    let deviceId1 = '';
    let deviceId4 = '';
    let deviceId1_u2 = '';

    beforeAll(async () => {
        //start app
        const server = await applicationBoot;
        application = server.app;
        await mongoose.connect(mongoUri + '/' + dbName + '?retryWrites=true&w=majority');

        await request(application.app)
            .delete('/testing/all-data');

        //created new users
        const newUser1 = await request(application.app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user1);

        user1Id = newUser1.body.id;

        const newUser2 = await request(application.app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user2);

        user2Id = newUser2.body.id;

        //login user device1
        const loginResult1 = await request(application.app)
            .post('/auth/login')
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            });

        cookies = loginResult1.get('Set-Cookie');
        refreshToken1 = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';
        sessionInfo = await jwtService.getSessionInfoByJwtToken(refreshToken1);
        deviceId1 = sessionInfo!.deviceId;
        expiredRefreshToken1 = await jwtService.createExpiredRefreshJWT(user1Id, deviceId1, '1.2.3.1')


        //login user2 device1
        const loginResult1_u2 = await request(application.app)
            .post('/auth/login')
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .send({
                "loginOrEmail": "user2",
                "password": "password2"
            });

        cookies = loginResult1_u2.get('Set-Cookie');
        refreshToken1_u2 = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';
        const sessionInfo2 = await jwtService.getSessionInfoByJwtToken(refreshToken1_u2);
        deviceId1_u2 = sessionInfo2!.deviceId;


        //login user1 device2
        const loginResult2 = await request(application.app)
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
        const loginResult3 = await request(application.app)
            .post('/auth/login')
            .set('X-Forwarded-For', `1.2.3.3`)
            .set('User-Agent', `device3`)
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            });

        cookies = loginResult3.get('Set-Cookie');
        refreshToken3 = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';


        //login user1 device4
        const loginResult4 = await request(application.app)
            .post('/auth/login')
            .set('X-Forwarded-For', `4.2.3.3`)
            .set('User-Agent', `device4`)
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            });

        cookies = loginResult4.get('Set-Cookie');
        refreshToken4 = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';
        sessionInfo = await jwtService.getSessionInfoByJwtToken(refreshToken4);
        deviceId4 = sessionInfo!.deviceId;
        expiredRefreshToken4 = await jwtService.createExpiredRefreshJWT(user1Id, deviceId4, `4.2.3.3`);

    });

    afterAll(async () => {
        await mongoose.connection.close();
        await delay(1000)
        application.close();
    });

    //Returns all devices with active sessions for current user
    it('GET: [HOST]/security/devices: should return code 401 no refreshToken', async () => {
        await request(application.app)
            .get('/security/devices')
            .set('X-Forwarded-For', `1.2.3.4`)
            .set('User-Agent', `android`)
            .expect(401);
    });
    it('GET: [HOST]/security/devices: should return code 200 when user connected on device1', async () => {
        const sessions = await request(application.app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken1}`)
            .set('X-Forwarded-For', `1.2.3.4`)
            .set('User-Agent', `android`)
            .expect(200);
    });


    // Terminate specified device session
    it('GET: [HOST]/security/devices/: should return code 200 when user1 connected on device1', async () => {
        await request(application.app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken1}`)
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .expect(200);
    });
    it('GET: [HOST]/security/devices/: should return code 200 when user2 connected on device1', async () => {
        await request(application.app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken1_u2}`)
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .expect(200);
    });
    it('DELETE: [HOST]/security/devices/${deviceId1}: should return code 401 with expired refreshToken user1 from device1', async () => {
        await request(application.app)
            .delete(`/security/devices/${deviceId1}`)
            .set('Cookie', `refreshToken=${expiredRefreshToken1}`)
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .expect(401);
    });
    it('DELETE: [HOST]/security/devices/${deviceId1}: should return code 403 if try to delete the deviceId of other user', async () => {
        await request(application.app)
            .delete(`/security/devices/${deviceId1}`)
            .set('Cookie', `refreshToken=${refreshToken1_u2}`)
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .expect(403);
    });
    it('DELETE: [HOST]/security/devices/${deviceId1}: should return code 404 if incorrect deviceId', async () => {
        await request(application.app)
            .delete(`/security/devices/63a88d39cab9d8769b178a12`)
            .set('Cookie', `refreshToken=${refreshToken1}`)
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .expect(404);
    });
    it('DELETE: [HOST]/security/devices/${deviceId1}: should return code 204 and deleted session1', async () => {
        await request(application.app)
            .delete(`/security/devices/${deviceId1}`)
            .set('Cookie', `refreshToken=${refreshToken1}`)
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .expect(204);
    });
    it('GET: [HOST]/security/devices/: should return code 401 when user1 connected on device1 after deleted session', async () => {
        await request(application.app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken1}`)
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .expect(401);
    });


    //Terminate all other (exclude current) device's sessions
    it('GET: [HOST]/security/devices: should return code 200 when user connected on device1', async () => {
        await request(application.app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken4}`)
            .set('X-Forwarded-For', `1.2.3.4`)
            .set('User-Agent', `device1`)
            .expect(200);
    });
    it('GET: [HOST]/security/devices: should return code 200 when user connected on device2', async () => {
        await request(application.app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken2}`)
            .set('X-Forwarded-For', `1.2.3.2`)
            .set('User-Agent', `device2`)
            .expect(200);
    });
    it('GET: [HOST]/security/devices: should return code 200 when user connected on device3', async () => {
        await request(application.app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken3}`)
            .set('X-Forwarded-For', `1.2.3.3`)
            .set('User-Agent', `device3`)
            .expect(200);
    });
    it('DELETE: [HOST]/security/devices: should return code 401 with expired refreshToken from device1', async () => {
        await request(application.app)
            .delete('/security/devices')
            .set('Cookie', `refreshToken=${expiredRefreshToken4}`)
            .set('X-Forwarded-For', `1.2.3.1`)
            .set('User-Agent', `device1`)
            .expect(401);
    });
    it('DELETE: [HOST]/security/devices: should return code 204 and deleted session2 & session3 from device1', async () => {
        await request(application.app)
            .delete('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken2}`)
            .set('X-Forwarded-For', `1.2.3.2`)
            .set('User-Agent', `device2`)
            .expect(204);
    });
    it('GET: [HOST]/security/devices: should return code 401 when user connected on device3', async () => {
        await request(application.app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken3}`)
            .set('X-Forwarded-For', `1.2.3.3`)
            .set('User-Agent', `device3`)
            .expect(401);
    });
    it('GET: [HOST]/security/devices: should return code 401 when user connected on device3', async () => {
        await request(application.app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${refreshToken4}`)
            .set('X-Forwarded-For', `1.2.3.4`)
            .set('User-Agent', `device4`)
            .expect(401);
    });
});