import request from 'supertest';
import {App} from "../src/app";
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import {applicationBoot} from '../src';


dotenv.config();
const mongoUri = process.env.MONGO_URI
const dbName = process.env.DB_NAME

let application: App;

const blog1 = {
    name: 'blog1',
    description:"description1",
    websiteUrl: 'https://youtube1.com'
};
const blog2 = {
    name: 'blog2',
    description:"description2",
    websiteUrl: 'https://youtube2.com'
};

const blog3 = {
    name: 'blog3',
    description:"description3",
    websiteUrl: 'https://youtube3.com'
};



describe('Test [HOST]/blogs', () => {
    let blog1Id='';
    let blog2Id='';

    beforeAll(async () => {
        //start app
        const server = await applicationBoot;
        application = server.app;
        await mongoose.connect(mongoUri + '/' + dbName + '?retryWrites=true&w=majority');

        await request(application.app)
            .delete('/testing/all-data')

        //create new blog
        const newBlog1 =  await request(application.app)
            .post('/blogs')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(blog1);
        blog1Id = newBlog1.body.id

        //create new blog
        const newBlog2 = await request(application.app)
            .post('/blogs')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(blog2);

        blog2Id = newBlog2.body.id
    });

    afterAll(async () => {
        //close app
        application.close();
        await mongoose.connection.close();
    });
    it('POST:[HOST]/blogs: should return code 401 "Unauthorized" for unauthorized request', async () => {
        await request(application.app)
            .post('/blogs')
            .send(blog1)
            .expect(401);
    });
    it('POST:[HOST]/blogs: should return code 201 and newBlog for correct input data', async () => {
        const newBlog3 = await request(application.app)
            .post('/blogs')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(blog3)
            .expect(201);
        expect(newBlog3.body).toEqual({
            id: expect.any(String),
            name: 'blog3',
            websiteUrl: 'https://youtube3.com',
            description: 'description3',
            createdAt: expect.any(String)
        });
    });
    it('POST:[HOST]/blogs: should return code 400 and error with field name for blog without name ', async () => {
        const newBlog1 = await request(application.app)
            .post('/blogs')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                description:"description1",
                websiteUrl: 'https://youtube1.com'
            })
            .expect(400);

        expect(newBlog1.body).toEqual({
            errorsMessages: [{
                message: expect.any(String),
                field: 'name'
            }]
        });
    });
    it('POST:[HOST]/blogs: should return code 400 and error with field name for blog with long name ', async () => {
        const newBlog1 = await request(application.app)
            .post('/blogs')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                name: '123456789123456789',
                description:"description1",
                websiteUrl: 'https://youtube2.com'
            })
            .expect(400);

        expect(newBlog1.body).toEqual({
            errorsMessages: [{
                message: expect.any(String),
                field: 'name'
            }]
        });
    });
    it('POST:[HOST]/blogs: should return code 400 and error with field name for blog with empty___ name ', async () => {
        const newBlog1 = await request(application.app)
            .post('/blogs')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                name: '         ',
                description:"description1",
                websiteUrl: 'https://youtube2.com'
            })
            .expect(400);

        expect(newBlog1.body).toEqual({
            errorsMessages: [{
                message: expect.any(String),
                field: 'name'
            }]
        });
    });
    it('POST:[HOST]/blogs: should return code 400 and error with field websiteUrl for blog with incorrect websiteUrl ', async () => {
        const newBlog1 = await request(application.app)
            .post('/blogs')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                name: 'name',
                description:"description1",
                websiteUrl: 'youtube2.com'
            })
            .expect(400);

        expect(newBlog1.body).toEqual({
            errorsMessages: [{
                message: expect.any(String),
                field: 'websiteUrl'
            }]
        });
    });
    it('POST:[HOST]/blogs: should return code 400 and error with field description for blog without description ', async () => {
        const newBlog1 = await request(application.app)
            .post('/blogs')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                name: 'name',
                websiteUrl: 'https://youtube2.com'
            })
            .expect(400);

        expect(newBlog1.body).toEqual({
            errorsMessages: [{
                message: expect.any(String),
                field: 'description'
            }]
        });
    });

    it('GET:[HOST]/blogs: should return code 200 and array with 2 elements with default paginator', async () => {
        const blogs = await request(application.app)
            .get('/blogs?sortDirection=asc')
            .expect(200);

        expect(blogs.body.items[0]).toEqual(
            {
                id: expect.any(String),
                name: 'blog1',
                description:"description1",
                websiteUrl: 'https://youtube1.com',
                createdAt: expect.any(String),
            });

        expect(blogs.body.items[1]).toEqual(
            {
                id: expect.any(String),
                name: 'blog2',
                description:"description2",
                websiteUrl: 'https://youtube2.com',
                createdAt: expect.any(String),
            });
    });
    it('GET:[HOST]/blogs: should return code 200 and array with 2 elements with queryParams:sortDirection=asc', async () => {
        const blogs = await request(application.app)
            .get('/blogs?sortDirection=asc')
            .expect(200);

        expect(blogs.body.items[0]).toEqual(
            {
                id: expect.any(String),
                name: 'blog1',
                description:"description1",
                websiteUrl: 'https://youtube1.com',
                createdAt: expect.any(String),
            });

        expect(blogs.body.items[1]).toEqual(
            {
                id: expect.any(String),
                name: 'blog2',
                description:"description2",
                websiteUrl: 'https://youtube2.com',
                createdAt: expect.any(String),
            });
    });
    it('GET:[HOST]/blogs: should return code 200 and array with 1 elements with queryParams:pageSize=1&sortDirection=asc', async () => {
        const blogs = await request(application.app)
            .get('/blogs?pageSize=1&sortDirection=asc')
            .expect(200);
        expect(blogs.body.items.length).toBe(1)

        expect(blogs.body.items[0]).toEqual(
            {
                id: expect.any(String),
                name: 'blog1',
                description:"description1",
                websiteUrl: 'https://youtube1.com',
                createdAt: expect.any(String),
            });

    });
    it('GET:[HOST]/blogs: should return code 200 and array with 1 elements with' +
        ' queryParams:pageNumber=2&pageSize=1&sortDirection=asc', async () => {
        const blogs = await request(application.app)
            .get('/blogs?pageNumber=2&pageSize=1&sortDirection=asc')
            .expect(200);
        expect(blogs.body.items.length).toBe(1)

        expect(blogs.body.items[0]).toEqual(
            {
                id: expect.any(String),
                name: 'blog2',
                description:"description2",
                websiteUrl: 'https://youtube2.com',
                createdAt: expect.any(String),
            });

    });
    it('GET:[HOST]/blogs: should return code 200 and array with 1 elements with queryParams:searchNameTerm=g1', async () => {
        const blogs = await request(application.app)
            .get('/blogs?searchNameTerm=g2')
            .expect(200);
        expect(blogs.body.items.length).toBe(1)

        expect(blogs.body.items[0]).toEqual(
            {
                id: expect.any(String),
                name: 'blog2',
                description:"description2",
                websiteUrl: 'https://youtube2.com',
                createdAt: expect.any(String),
            });

    });

    it('GET:[HOST]/blogs/{:id}: should return code 404 for incorrect ID', async () => {
        await request(application.app)
            .get('/blogs/qwe-ss---s-s-s-srty')
            .expect(404);
    });
    it('GET:[HOST]/blogs/{:id}: should return code 200 and equal blog for correct request', async () => {

        const blog = await request(application.app)
            .get(`/blogs/${blog1Id}`)
            .expect(200);

        expect(blog.body).toEqual({
            id: expect.any(String),
            name: 'blog1',
            description:"description1",
            websiteUrl: 'https://youtube1.com',
            createdAt:expect.any(String)
        });
    });

    it('DELETE:[HOST]/blogs/{:id}: should return code 401 "Unauthorized" for unauthorized request', async () => {
        await request(application.app)
            .delete('/blogs/1')
            .expect(401);
    });
    it('DELETE:[HOST]/blogs/{:id}: should return code 404 for incorrect ID', async () => {
        await request(application.app)
            .delete('/blogs/qwerty')
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(404);
    });
    it('DELETE:[HOST]/blogs/{:id}: should return code 204 for correct request, and should return 404 for GET by id', async () => {

        await request(application.app)
            .delete(`/blogs/${blog1Id}`)
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(204);

        await request(application.app)
            .get(`/blogs/${blog1Id}`)
            .expect(404);
    });

    it('PUT:[HOST]/blogs/{:id}: should return code 401 "Unauthorized" for unauthorized request', async () => {
        await request(application.app)
            .put(`/blogs/${blog2Id}`)
            .expect(401);
    });
    it('PUT:[HOST]/blogs/{:id}: should return code 204 correct input data', async () => {
        await request(application.app)
            .put(`/blogs/${blog2Id}`)
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                name: 'blog5',
                description: "description-edit",
                websiteUrl: 'https://youtube5.com'
            })
            .expect(204);

        const changedBlog = await request(application.app)
            .get(`/blogs/${blog2Id}`);

        expect(changedBlog.body).toEqual({
            id: expect.any(String),
            name: 'blog5',
            description: "description-edit",
            websiteUrl: 'https://youtube5.com',
            createdAt:expect.any(String)

        });
    });
    it('PUT:[HOST]/blogs/{:id}: should return code 404 for incorrect ID', async () => {
        await request(application.app)
            .put(`/blogs/3333333333333`)
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                name: 'blog5',
                description: "description-edit",
                websiteUrl: 'https://youtube5.com'
            })
            .expect(404);

        // const changedBlog = await request(application.app)
        //     .get(`/blogs/${id}`);
        //
        // expect(changedBlog.body).toEqual({
        //     id: expect.any(String),
        //     name: 'blog5',
        //     description: "description-edit",
        //     websiteUrl: 'https://youtube5.com',
        //     createdAt:expect.any(String)
        // });
    });
    it('PUT:[HOST]/blogs/{:id}: should return code 400 for incorrect input data', async () => {
        await request(application.app)
            .put(`/blogs/${blog2Id}`)
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                name: 'blog5',
                description: "description-edit",
                websiteUrl: 'youtube5.com'
            })
            .expect(400);

    });
});
