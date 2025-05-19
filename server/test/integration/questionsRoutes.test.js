import * as chai from 'chai';
import request from 'supertest';
import { app } from '../../index.js';
import Question from '../../models/Question.js';
import Option from '../../models/Option.js';
import User from '../../models/User.js';

chai.should();
const { expect } = chai;

describe('Question Routes', () => {
  let adminToken;
  let questionId;
  let adminUserId;

  before(async () => {
    const adminUser = new User({
      username: 'adminuser',
      password: 'AdminPassword123!',
      email: 'adminuser@example.com',
      isAdmin: true,
    });
    const savedAdminUser = await adminUser.save();
    adminUserId = savedAdminUser._id;

    const loginResponse = await request(app)
      .post('/users/login')
      .send({ username: 'adminuser', password: 'AdminPassword123!' });
    adminToken = loginResponse.body.token;
  });

  after(async () => {
    await Question.deleteMany({ questionText: { $regex: 'Test Question' } });
    await Option.deleteMany({ optionText: { $regex: 'Test Option' } });
    await User.findByIdAndDelete(adminUserId);
  });

  describe('POST /questions/add', () => {
    it('should add a new question', (done) => {
      const newQuestion = {
        questionText: 'Test Question 1',
        options: [
          { optionText: 'Test Option 1', isCorrect: false },
          { optionText: 'Test Option 2', isCorrect: true },
        ],
      };

      request(app)
        .post('/questions/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newQuestion)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body).to.have.property('questionText', 'Test Question 1');
          questionId = res.body._id;
          done();
        });
    });
  });

  describe('GET /questions/:id', () => {
    beforeEach(async () => {
      const newQuestion = new Question({
        questionText: 'Test Question 2',
      });
      const savedQuestion = await newQuestion.save();
      questionId = savedQuestion._id;
    });

    it('should retrieve a question by ID', (done) => {
      request(app)
        .get(`/questions/${questionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('questionText', 'Test Question 2');
          done();
        });
    });
  });

  describe('GET /questions', () => {
    it('should retrieve all questions', (done) => {
      request(app)
        .get('/questions')
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });
  });

  describe('PUT /questions/:id', () => {
    beforeEach(async () => {
      const newQuestion = new Question({
        questionText: 'Test Question to Update',
      });
      const savedQuestion = await newQuestion.save();
      questionId = savedQuestion._id;
    });

    it('should update a question by ID', (done) => {
      const updatedQuestion = {
        questionText: 'Updated Test Question',
        options: [
          { optionText: 'Updated Option 1', isCorrect: false },
          { optionText: 'Updated Option 2', isCorrect: true },
        ],
      };

      request(app)
        .put(`/questions/${questionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedQuestion)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('questionText', 'Updated Test Question');
          done();
        });
    });
  });

  describe('DELETE /questions/:id', () => {
    beforeEach(async () => {
      const newQuestion = new Question({
        questionText: 'Test Question to Delete',
      });
      const savedQuestion = await newQuestion.save();
      questionId = savedQuestion._id;
    });

    it('should delete a question by ID', (done) => {
      request(app)
        .delete(`/questions/${questionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('message', 'A kérdés sikeresen törölve.');
          done();
        });
    });
  });
});
