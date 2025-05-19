import * as chai from 'chai';
import request from 'supertest';
import { app } from '../../index.js';
import User from '../../models/User.js';
import Request from '../../models/Request.js';
import Quiz from '../../models/Quiz.js';

chai.should();
const { expect } = chai;

describe('Requests Routes', () => {
  let userToken;
  let userId;
  let requestId;

  before(async () => {
    const user = new User({
      username: 'testuser',
      password: 'Password123!',
      email: 'testuser@example.com',
    });
    const savedUser = await user.save();
    userId = savedUser._id;

    const loginResponse = await request(app)
      .post('/users/login')
      .send({ username: 'testuser', password: 'Password123!' });
    userToken = loginResponse.body.token;
  });

  after(async () => {
    await User.findByIdAndDelete(userId);
    await Request.deleteMany({ title: { $regex: 'Test Request' } });
  });

  describe('POST /requests/add', () => {
    it('should create a new request with valid data', (done) => {
      const newRequest = {
        title: 'Test Request',
      };
  
      request(app)
        .post('/requests/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newRequest)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body).to.have.property('title', 'Test Request');
          requestId = res.body._id;
          done();
        });
    });
  
    it('should not create a request with missing title', (done) => {
      const invalidRequest = {
        title: '',
      };
  
      request(app)
        .post('/requests/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidRequest)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('error', 'A kvíz témájának megadása kötelező.');
          done();
        });
    });
  
    it('should not create a request if quiz with same title exists', async () => {
      const quiz = new Quiz({
        title: 'Test Quiz',
        questions: [],
        questionCount: 5,
      });
      await quiz.save();
  
      const newRequest = {
        title: 'Test Quiz',
      };
  
      const response = await request(app)
        .post('/requests/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newRequest);
  
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error', 'Már létezik ilyen kvíz.');
  
      await Quiz.findByIdAndDelete(quiz._id);
    });
  
    it('should not allow creating a duplicate request title', async () => {
      const duplicateRequest = { title: 'Test Request' };
      const response = await request(app)
        .post('/requests/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send(duplicateRequest);
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error', 'Már létezik ilyen kérelem.');
    });
  });
  
  describe('GET /requests', () => {
    it('should retrieve all requests', (done) => {
      request(app)
        .get('/requests')
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.be.greaterThan(0);
          done();
        });
    });
  });
  
  describe('PUT /requests/:id/upvote', () => {
    let secondUserToken;
    let secondUserId;
  
    before(async () => {
      const secondUser = new User({
        username: 'seconduser',
        password: 'Password123!',
        email: 'seconduser@example.com',
      });
      const savedSecondUser = await secondUser.save();
      secondUserId = savedSecondUser._id;
  
      const loginResponse = await request(app)
        .post('/users/login')
        .send({ username: 'seconduser', password: 'Password123!' });
      secondUserToken = loginResponse.body.token;
    });
  
    after(async () => {
      await User.findByIdAndDelete(secondUserId);
    });
  
    it('should upvote a request by a different user', (done) => {
      request(app)
        .put(`/requests/${requestId}/upvote`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('message', 'Sikeres szavazás');
          expect(res.body.request.upvotes).to.include(secondUserId.toString());
          done();
        });
    });
  
    it('should not upvote own request', (done) => {
      request(app)
        .put(`/requests/${requestId}/upvote`)
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('error', 'Nem szavazhat a saját kérelmére.');
          done();
        });
    });
  });    
});
