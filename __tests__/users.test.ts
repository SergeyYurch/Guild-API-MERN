import request from 'supertest';
import {app} from "../src/app";
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

describe('POST: /users create new user', () => {
    beforeAll(async () => {
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        await mongoose.connect(mongoUri + '/' + dbName+'?retryWrites=true&w=majority');
        await request(app)
            .delete('/testing/all-data');
    });
    /* Closing database connection after each test. */
    afterAll(async () => {
        await mongoose.connection.close();
    });
    it('should return code 401 "Unauthorized" for unauthorized request', async () => {
        console.log('????????????????????????????????');
        await request(app)
            .post('/users')
            .send(user1)
            .expect(401);
    });
    it('should return code 201 and new user for correct input data', async () => {
        const newUser1 = await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user1)
            .expect(201);

        expect(newUser1.body).toEqual({
            id: expect.any(String),
            login: 'user1',
            email: 'email1@gmail.com',
            createdAt: expect.any(String)
        });
    });
    it('should return code 400 and error message for field login', async () => {
        const newUser1 = await request(app)
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
    it('should return code 400 and error with field password', async () => {
        const newUser1 = await request(app)
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
});

describe('GET: /users get all users', () => {
    beforeAll(async () => {
        await mongoose.connect(mongoUri + '/' + dbName+'?retryWrites=true&w=majority');
        await request(app)
            .delete('/testing/all-data');

        //create new user
        await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user1);
        //create new user
        await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user2);

    });
    /* Closing database connection after each test. */
    afterAll(async () => {
        await mongoose.connection.close();
    });
    it('should return code 401 for unauthorized user', async () => {
        await request(app)
            .post('/users')
            .send(user1)
            .expect(401);
    });
    it('should return code 200 and array with 2 elements with default paginator', async () => {
        const users = await request(app)
            .get('/users')
            .expect(200);

        expect(users.body.totalCount).toBe(2)

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
    it('should return code 200 and array with 1 elements with queryParams:pageSize=1&sortDirection=asc', async () => {
        const users = await request(app)
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
    it('should return code 200 and array with 1 elements with queryParams:searchLoginTerm=r1', async () => {
        const users = await request(app)
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
});

describe('DELETE:/users/id delete user by Id', () => {
    let id=''
    beforeAll(async () => {
        await mongoose.connect(mongoUri + '/' + dbName+'?retryWrites=true&w=majority');
        await request(app)
            .delete('/testing/all-data');

        const newUser1 = await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(user1)
            .expect(201);
        id = newUser1.body.id;

    });
    /* Closing database connection after each test. */
    afterAll(async () => {
        await mongoose.connection.close();
    });
    it('should return code 401 for unauthorized user', async () => {
        await request(app)
            .delete(`/users/${id}`)
            .expect(401);
    });
    it('should return code 404 for incorrect ID', async () => {
        await request(app)
            .get('/users/qwe-ss---s-s-s-srty')
            .expect(404);
    });
    it('should return code 204 for correct userId and user should be deleted', async () => {
        await request(app)
            .delete(`/users/${id}`)
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(204);

        const users = await request(app)
            .get('/users')

        expect(users.body.totalCount).toBe(0)
    });
});
