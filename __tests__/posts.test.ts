import request from 'supertest';
import {App} from "../src/app";
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import {applicationBoot} from '../src';
import {delay} from '../src/helpers/helpers';

dotenv.config();
const mongoUri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

const blog1 = {
    name: 'blog1',
    description: "description1",
    websiteUrl: 'https://youtube1.com'
};

let application: App;

describe('Test[HOST]/posts', () => {
    let blogId = '';
    let post1Id = '';
    let post2Id = '';
    let user1Id = '';
    let user2Id = '';
    let user3Id = '';
    let user4Id = '';
    let accessToken1 = '';
    let accessToken2 = '';
    let accessToken3 = '';
    let accessToken4 = '';
    let token_ = '';
    let cookies = [];
    let refreshToken_u1 = '';
    let refreshToken_u2 = '';


    beforeAll(async () => {
        //start app
        const server = await applicationBoot;
        application = server.app;
        await mongoose.connect(mongoUri + '/' + dbName + '?retryWrites=true&w=majority');

        await request(application.app)
            .delete('/testing/all-data');
        //create blog
        const newBlog1 = await request(application.app)
            .post('/blogs')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(blog1);
        blogId = newBlog1.body.id;

        // create users
        //User1
        const newUser1 = await request(application.app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                login: "user1",
                password: "password1",
                email: "email1@gmail.com"
            });


        const loginResult1 = await request(application.app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            });

        user1Id = newUser1.body.id;
        accessToken1 = loginResult1.body.accessToken;
        cookies = loginResult1.get('Set-Cookie');
        refreshToken_u1 = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';
        token_ = loginResult1.body.accessToken;

        //User2

        const newUser2 = await request(application.app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                login: "user2",
                password: "password2",
                email: "email2@gmail.com"
            });
        const loginResult2 = await request(application.app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "user2",
                "password": "password2"
            });
        user2Id = newUser2.body.id;
        cookies = loginResult2.get('Set-Cookie');
        refreshToken_u2 = cookies[0].split(';').find(c => c.includes('refreshToken'))?.split('=')[1] || 'no token';
        accessToken2 = loginResult2.body.accessToken;

        //User3

        const newUser3 = await request(application.app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                login: "user3",
                password: "password3",
                email: "email3@gmail.com"
            });
        const loginResult3 = await request(application.app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "user3",
                "password": "password3"
            });
        user3Id = newUser3.body.id;
        accessToken3 = loginResult3.body.accessToken;

        const newUser4 = await request(application.app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                login: "user4",
                password: "password4",
                email: "email4@gmail.com"
            });
        const loginResult4 = await request(application.app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "user4",
                "password": "password4"
            });
        user4Id = newUser4.body.id;
        accessToken4 = loginResult4.body.accessToken;

    });

    afterAll(async () => {
        await mongoose.connection.close();
        await delay(1000)
        application.close();
    });

    it('POST:[HOST]/posts: should return code 401 "Unauthorized" for unauthorized request', async () => {
        await request(application.app)
            .post('/posts')
            .send({
                title: 'post1',
                shortDescription: 'shortDescription1',
                content: 'content1',
                blogId: blogId
            })
            .expect(401);
    });
    it('POST:[HOST]/posts: should return code 400 and error with field title for blog without title ', async () => {

        const newPost = await request(application.app)
            .post('/posts')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                shortDescription: 'shortDescription1',
                content: 'content1',
                blogId: blogId
            })
            .expect(400);

        expect(newPost.body).toEqual({
            errorsMessages: [{
                field: 'title',
                message: expect.any(String)
            }]
        });
    });
    it('POST:[HOST]/posts: should return code 400 and error with relevant field for incorrect title ', async () => {

        const newPost = await request(application.app)
            .post('/posts')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                title: "1234567891123456789112345678912",
                shortDescription: 'shortDescription1',
                content: 'content1',
                blogId: blogId
            })
            .expect(400);

        expect(newPost.body).toEqual({
            errorsMessages: [{
                message: expect.any(String),
                field: 'title'
            }]
        });
    });
    it('POST:[HOST]/posts: should return code 400 and error with relevant field for blog without shortDescription ', async () => {

        const newPost = await request(application.app)
            .post('/posts')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                title: 'title',
                shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
                    ' Donec libero odio, feugiat eu aliquet a, porta quis lectus. Maecenas et' +
                    ' turpis quis neque faucibus ultricies. Aliquam condimentum suscipit erat,' +
                    ' eget efficitur ex cursus nec. Maecenas a dignissim odio. Vivamus at arcu' +
                    ' aliquet, fringilla nulla ut, ornare neque. Mauris a metus ut orci' +
                    ' facilisis iaculis sed ac ex. Donec vel massa eget orci varius venenatis. ' +
                    'Sed consectetur sodales ex tincidunt porttitor. Sed porta blandit dui sed' +
                    ' lobortis.  Quisque semper tortor at urna pellentesque fringilla sit amet' +
                    '  sed sapien. Etiam at eros id tellus placerat iaculis ut et metus. Mauris' +
                    ' semper  massa nunc. Vestibulum condimentum massa ac neque euismod, a' +
                    ' viverra  tortor bibendum. Praesent ultricies ut libero sit amet pretium. Orci varius.',
                content: 'content1',
                blogId: blogId
            })
            .expect(400);

        expect(newPost.body).toEqual({
            errorsMessages: [{
                message: expect.any(String),
                field: 'shortDescription'
            }]
        });
    });
    it('POST:[HOST]/posts: should return code 400 and error with field content for blog without content ', async () => {

        const newPost = await request(application.app)
            .post('/posts')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                title: 'title1',
                shortDescription: 'shortDescription1',
                blogId: blogId
            })
            .expect(400);

        expect(newPost.body).toEqual({
            errorsMessages: [{
                message: expect.any(String),
                field: 'content'
            }]
        });
    });
    it('POST:[HOST]/posts: should return code 400 and error with field blogId for blog without blogId ', async () => {

        const newPost = await request(application.app)
            .post('/posts')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                title: 'title1',
                shortDescription: 'shortDescription1',
                content: 'content1'
            })
            .expect(400);

        expect(newPost.body).toEqual({
            errorsMessages: [{
                message: expect.any(String),
                field: 'blogId'
            }]
        });
    });
    it('POST:[HOST]/posts: should return code 400 and error with relevant field for incorrect blogId ', async () => {

        const newPost = await request(application.app)
            .post('/posts')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                title: "title1",
                shortDescription: 'shortDescription1',
                content: 'content1',
                blogId: 'blogId'
            })
            .expect(400);

        expect(newPost.body).toEqual({
            errorsMessages: [{
                message: expect.any(String),
                field: 'blogId'
            }]
        });
    });
    it('POST:[HOST]/posts: should return code 201 and newBlog for correct input data', async () => {

        const newPost = await request(application.app)
            .post('/posts')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                title: 'title1',
                shortDescription: 'shortDescription1',
                content: 'content1',
                blogId: blogId
            })
            .expect(201);

        post1Id = newPost.body.id;

        expect(newPost.body).toEqual({
            id: expect.any(String),
            title: 'title1',
            shortDescription: 'shortDescription1',
            content: 'content1',
            blogId: blogId,
            blogName: 'blog1',
            createdAt: expect.any(String),
            extendedLikesInfo: {
                dislikesCount: 0,
                likesCount: 0,
                myStatus: "None",
                newestLikes: null,
            }
        });
    });

    it('GET:[HOST]/posts: should return code 200 and array with 2 elements', async () => {

        //create newPost2
        const newPost2 = await request(application.app)
            .post('/posts')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                title: "title2",
                shortDescription: 'shortDescription2',
                content: 'content2',
                blogId: blogId
            });
        post2Id = newPost2.body.id;

        const posts = await request(application.app)
            .get('/posts')
            .expect(200);

        expect(posts.body.items[1]).toEqual(
            {
                id: expect.any(String),
                title: 'title1',
                shortDescription: 'shortDescription1',
                content: 'content1',
                blogId: blogId,
                blogName: 'blog1',
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    dislikesCount: 0,
                    likesCount: 0,
                    myStatus: "None",
                    newestLikes: [],
                }
            });

        expect(posts.body.items[0]).toEqual(
            {
                id: expect.any(String),
                title: 'title2',
                shortDescription: 'shortDescription2',
                content: 'content2',
                blogId: blogId,
                blogName: 'blog1',
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    dislikesCount: 0,
                    likesCount: 0,
                    myStatus: "None",
                    newestLikes: [],
                }
            });
    });
    it('GET:[HOST]/posts: should return code 404 for incorrect ID', async () => {
        await request(application.app)
            .get('/posts/qwerty')
            .expect(404);
    });

    it('PUT:[HOST]/posts: should return code 401 "Unauthorized" for unauthorized request', async () => {

        await request(application.app)
            .put(`/posts/${post1Id}`)
            .send({
                title: 'title3',
                content: 'content3',
                shortDescription: 'shortDescription3',
                blogId: 'blogId'
            })
            .expect(401);
    });
    it('PUT:[HOST]/posts: should return code 404 for incorrect ID', async () => {
        await request(application.app)
            .put('/posts/qwerty')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                title: 'title1',
                content: 'content1',
                shortDescription: 'shortDescription1',
                blogId: blogId
            })
            .expect(404);
    });
    it('PUT:[HOST]/posts: should return code 204 and equal post for correct request', async () => {

        await request(application.app)
            .put(`/posts/${post1Id}`)
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                title: 'title3',
                content: 'content3',
                shortDescription: 'shortDescription3',
                blogId: blogId
            })
            .expect(204);

        const post = await request(application.app)
            .get(`/posts/${post1Id}`);

        expect(post.body).toEqual({
            id: expect.any(String),
            title: 'title3',
            shortDescription: 'shortDescription3',
            content: 'content3',
            blogId: blogId,
            blogName: 'blog1',
            createdAt: expect.any(String),
            extendedLikesInfo: {
                dislikesCount: 0,
                likesCount: 0,
                myStatus: "None",
                newestLikes: [],
            }
        });
    });

    it('DELETE:[HOST]/posts: should return code 401 "Unauthorized" for unauthorized request', async () => {
        await request(application.app)
            .delete(`/posts/${post2Id}`)
            .expect(401);
    });
    it('DELETE:[HOST]/posts: should return code 404 for incorrect ID', async () => {
        await request(application.app)
            .delete(`/posts/id`)
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(404);
    });
    it('DELETE:[HOST]/posts: should return code 204 for correct request, and should return 404 for GET by id', async () => {
        await request(application.app)
            .delete(`/posts/${post2Id}`)
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(204);

        await request(application.app)
            .get(`/posts/${post2Id}`)
            .expect(404);
    });

    it('POST:[HOST]/posts/{postId}/comments: should return code 401 "Unauthorized" for unauthorized request', async () => {
        await request(application.app)
            .post(`/posts/${post1Id}/comments`)
            .auth('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MzkwZjI4MDRkZWJkZmNiOTZhODkxYjgiLCJpYXQiOjE2NzA2NzI4MzQsImV4cCI6MTY3MDcwODgzNH0.g5lv07SozaP8hMeQKfw5NrSXPW7-Lb55ZSpgWzqTU-U', {type: 'bearer'})
            //.auth(token_, {type: 'bearer'})
            .send({
                content: 'comment1comment1comment1',
            })
            .expect(401);
    });
    it('POST:[HOST]/posts/{postId}/comments: should return code 400  If the inputModel has incorrect values', async () => {
        await request(application.app)
            .post(`/posts/${post1Id}/comments`)
            .auth(accessToken1, {type: "bearer"})
            .send({
                content: 'content1',
            })
            .expect(400);
    });
    it('POST:[HOST]/posts/{postId}/comments: should return code 404 If post with specified postId doesn\'t exists ', async () => {

        await request(application.app)
            .post(`/posts/11111111111111/comments`)
            .auth(accessToken1, {type: "bearer"})
            .send({
                content: 'comment1comment1comment1'
            })
            .expect(404);
    });
    it('POST:[HOST]/posts/{postId}/comments: should return code 201 and newly created comment', async () => {
        const comment = await request(application.app)
            .post(`/posts/${post1Id}/comments`)
            .auth(accessToken1, {type: 'bearer'})
            .send({
                content: 'comment 1 comment 1 comment 1',
            })
            .expect(201);
        expect(comment.body).toEqual({
            id: expect.any(String),
            content: "comment 1 comment 1 comment 1",
            userId: user1Id,
            userLogin: "user1",
            createdAt: expect.any(String),
            likesInfo: {
                dislikesCount: 0,
                likesCount: 0,
                myStatus: "None"
            },
        });

        await request(application.app)
            .post(`/posts/${post1Id}/comments`)
            .auth(accessToken1, {type: 'bearer'})
            .send({
                content: 'comment 2 comment 2 comment 2',
            });

    });

    it('GET:[HOST]/posts/{postId}/comments: should return code 200 and body with comments', async () => {
        const comment = await request(application.app)
            .get(`/posts/${post1Id}/comments`)
            .auth(accessToken1, {type: 'bearer'})
            .expect(200);
        console.log(comment.body);
        expect(comment.body).toEqual(
            {
                "pagesCount": 1,
                "page": 1,
                "pageSize": 10,
                "totalCount": 2,
                "items": [
                    {
                        id: expect.any(String),
                        content: "comment 2 comment 2 comment 2",
                        userId: user1Id,
                        userLogin: "user1",
                        createdAt: expect.any(String),
                        likesInfo: {
                            dislikesCount: 0,
                            likesCount: 0,
                            myStatus: "None"
                        }
                    },
                    {
                        id: expect.any(String),
                        content: "comment 1 comment 1 comment 1",
                        userId: user1Id,
                        userLogin: "user1",
                        createdAt: expect.any(String),
                        likesInfo: {
                            dislikesCount: 0,
                            likesCount: 0,
                            myStatus: "None"
                        }
                    }
                ]
            }
        );
    });

    it('PUT:[HOST]/posts/{postId}/like-status: should return code 204 and equal post for correct request', async () => {

        //LIKE from user1
        await request(application.app)
            .put(`/posts/${post1Id}/like-status`)
            .auth(accessToken1, {type: 'bearer'})
            .send({
                likeStatus: 'Like'
            })
            .expect(204);

        await delay(1000)
        //DISLIKE from user2
        await request(application.app)
            .put(`/posts/${post1Id}/like-status`)
            .auth(accessToken2, {type: 'bearer'})
            .send({
                likeStatus: 'Dislike'
            })
            .expect(204);

        await delay(1000)

        //LIKE from user3
        await request(application.app)
            .put(`/posts/${post1Id}/like-status`)
            .auth(accessToken3, {type: 'bearer'})
            .send({
                likeStatus: 'Like'
            })
            .expect(204);

        await delay(1000)

        //LIKE from user4
        await request(application.app)
            .put(`/posts/${post1Id}/like-status`)
            .auth(accessToken4, {type: 'bearer'})
            .send({
                likeStatus: 'Like'
            })
            .expect(204);


        const post = await request(application.app)
            .get(`/posts/${post1Id}`)
            .auth(accessToken4, {type: 'bearer'})

        expect(post.body.extendedLikesInfo).toEqual({
            likesCount: 3,
            dislikesCount: 1,
            myStatus: 'Like',
            newestLikes: [
                {
                    login: 'user4',
                    userId: user4Id,
                    addedAt: expect.any(String)
                },
                {
                    login: 'user3',
                    userId: user3Id,
                    addedAt: expect.any(String)
                },
                {
                    login: 'user1',
                    userId: user1Id,
                    addedAt: expect.any(String)
                }
            ]
        });
    });

    it('PUT:[HOST]/posts/{postId}/like-status: should return code 204 and equal post after changing like-status', async () => {

        //LIKE from user2
        await request(application.app)
            .put(`/posts/${post1Id}/like-status`)
            .auth(accessToken2, {type: 'bearer'})
            .send({
                likeStatus: 'Like'
            })
            .expect(204);



        const post = await request(application.app)
            .get(`/posts/${post1Id}`)
            .auth(accessToken2, {type: 'bearer'})


        expect(post.body.extendedLikesInfo).toEqual({
            likesCount: 4,
            dislikesCount: 0,
            myStatus: 'Like',
            newestLikes: [

                {
                    login: 'user4',
                    userId: user4Id,
                    addedAt: expect.any(String)
                },
                {
                    login: 'user3',
                    userId: user3Id,
                    addedAt: expect.any(String)
                },
                {
                    login: 'user2',
                    userId: user2Id,
                    addedAt: expect.any(String)
                },
            ]
        });
    });

    it('PUT:[HOST]/posts/{postId}/like-status: should return code 204 and equal post after changing like-status', async () => {

        //None like from user2
        await request(application.app)
            .put(`/posts/${post1Id}/like-status`)
            .auth(accessToken2, {type: 'bearer'})
            .send({
                likeStatus: 'None'
            })
            .expect(204);



        const post = await request(application.app)
            .get(`/posts/${post1Id}`)
            .auth(accessToken2, {type: 'bearer'})


        expect(post.body.extendedLikesInfo).toEqual({
            likesCount: 4,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [

                {
                    login: 'user4',
                    userId: user4Id,
                    addedAt: expect.any(String)
                },
                {
                    login: 'user3',
                    userId: user3Id,
                    addedAt: expect.any(String)
                },
                {
                    login: 'user1',
                    userId: user1Id,
                    addedAt: expect.any(String)
                },
            ]
        });
    });

});
