import request from 'supertest';
import {App} from "../src/app";
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import {applicationBoot} from '../src';
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

describe('Test:[HOST]/users', () => {
    let user1Id = '';
    beforeAll(async () => {
        //start app
        const server = await applicationBoot;
        application = server.app;
        await mongoose.connect(mongoUri + '/' + dbName + '?retryWrites=true&w=majority');

        await request(application.app)
            .delete('/testing/all-data');
    });
    /* Closing database connection after each test. */
    afterAll(async () => {
        await mongoose.connection.close();
        await delay(1000)
        application.close();
    });

//post
    it('POST: [HOST]/users: should return code 401 "Unauthorized" for unauthorized request', async () => {
        await request(application.app)
            .post('/users')
            .send(user1)
            .expect(401);
    });
    it('POST: [HOST]/users: should return code 201 and new user for correct input data', async () => {
        const newUser1 = await request(application.app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user1)
            .expect(201);
        user1Id = newUser1.body.id;
        expect(newUser1.body).toEqual({
            id: expect.any(String),
            login: 'user1',
            email: 'email1@gmail.com',
            createdAt: expect.any(String)
        });
        //create new user2
        await request(application.app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user2);
    });
    it('POST: [HOST]/users: should return code 400 and error message for field login', async () => {
        const newUser1 = await request(application.app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                password: "password1",
                email: "email221@gmail.com"
            })
            .expect(400);

        expect(newUser1.body).toEqual({
            errorsMessages: [{
                message: expect.any(String),
                field: 'login'
            }]
        });
    });
    it('POST: [HOST]/users: should return code 400 and error with field password', async () => {
        const newUser1 = await request(application.app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                login: 'qwetrsbdh',
                email: "wwwwwee@dddddd.com"
            })
            .expect(400);

        expect(newUser1.body).toEqual({
            errorsMessages: [{
                message: expect.any(String),
                field: 'password'
            }]
        });
    });
    it('POST: [HOST]/users: should return code 401 for unauthorized user', async () => {
        await request(application.app)
            .post('/users')
            .send(user1)
            .expect(401);
    });
//get
    it('GET: [HOST]/users: should return code 200 and array with 2 elements with default paginator', async () => {
        const users = await request(application.app)
            .get('/users')
            .expect(200);

        expect(users.body.totalCount).toBe(2);

        expect(users.body.items[0]).toEqual(
            {
                id: expect.any(String),
                login: 'user1',
                email: "email1@gmail.com",
                createdAt: expect.any(String),
            });

        expect(users.body.items[1]).toEqual(
            {
                id: expect.any(String),
                login: 'user2',
                email: "email2@gmail.com",
                createdAt: expect.any(String),
            });
    });
    it('GET: [HOST]/users: should return code 200 and array with 1 elements with queryParams:pageSize=1&sortDirection=asc', async () => {
        const users = await request(application.app)
            .get('/users?pageSize=1&sortDirection=asc')
            .expect(200);
        expect(users.body.items.length).toBe(1);

        expect(users.body.items[0]).toEqual(
            {
                id: expect.any(String),
                login: 'user1',
                email: "email1@gmail.com",
                createdAt: expect.any(String),
            });

    });
    it('GET: [HOST]/users: should return code 200 and array with 1 elements with queryParams:searchLoginTerm=r1', async () => {
        const users = await request(application.app)
            .get('/users?searchLoginTerm=r1')
            .expect(200);

        expect(users.body.items.length).toBe(1);

        expect(users.body.items[0]).toEqual(
            {
                id: expect.any(String),
                login: 'user1',
                email: "email1@gmail.com",
                createdAt: expect.any(String),
            });

    });
//delete
    it('DELETE: [HOST]/users: should return code 401 for unauthorized user', async () => {
        await request(application.app)
            .delete(`/users/${user1Id}`)
            .expect(401);
    });
    it('DELETE: [HOST]/users: should return code 404 for incorrect ID', async () => {
        await request(application.app)
            .get('/users/qwe-ss---s-s-s-srty')
            .expect(404);
    });
    it('DELETE: [HOST]/users: should return code 204 for correct userId and user should be deleted', async () => {

        let users = await request(application.app)
            .get('/users');

        expect(users.body.totalCount).toBe(2);

        await request(application.app)
            .delete(`/users/${user1Id}`)
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(204);

        users = await request(application.app)
            .get('/users');

        expect(users.body.totalCount).toBe(1);
    });

});
