import * as chai from 'chai';
import request from 'supertest';
import { app } from '../../index.js';
import Option from '../../models/Option.js';
import Question from '../../models/Question.js';
import User from '../../models/User.js';

chai.should();
const { expect } = chai;

describe('Options Routes', () => {
  let adminToken;
  let questionId;
  let optionId;
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

    const newQuestion = new Question({
      questionText: 'Test question?',
    });
    const savedQuestion = await newQuestion.save();
    questionId = savedQuestion._id;
  });

  beforeEach(async () => {
    await Option.deleteMany({ optionText: { $regex: 'Test Option' } });
  });

  after(async () => {
    await Option.deleteMany({ optionText: { $regex: 'Test Option' } });
    await Question.findByIdAndDelete(questionId);
    await User.findByIdAndDelete(adminUserId);
  });

  describe('POST /options/add', () => {
    it('should add a new option to a question', (done) => {
      const newOption = {
        questionId,
        optionText: 'Test Option Addition',
        isCorrect: true,
      };

      request(app)
        .post('/options/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newOption)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body).to.have.property('optionText', 'Test Option Addition');
          expect(res.body).to.have.property('isCorrect', true);
          done();
        });
    });
  });

  describe('GET /options/:id', () => {
    beforeEach(async () => {
      const newOption = new Option({
        optionText: 'Test Option Retrieval',
        isCorrect: true,
      });
      const savedOption = await newOption.save();
      optionId = savedOption._id;
    });

    it('should retrieve an option by ID', (done) => {
      request(app)
        .get(`/options/${optionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('optionText', 'Test Option Retrieval');
          expect(res.body).to.have.property('isCorrect', true);
          done();
        });
    });
  });

  describe('PUT /options/:id', () => {
    beforeEach(async () => {
      const newOption = new Option({
        optionText: 'Test Option Update',
        isCorrect: false,
      });
      const savedOption = await newOption.save();
      optionId = savedOption._id;
    });

    it('should update an option by ID', (done) => {
      const updatedOption = {
        optionText: 'Test Updated Option',
        isCorrect: true,
      };

      request(app)
        .put(`/options/${optionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedOption)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('optionText', 'Test Updated Option');
          expect(res.body).to.have.property('isCorrect', true);
          done();
        });
    });
  });

  describe('DELETE /options/:id', () => {
    beforeEach(async () => {
      const newOption = new Option({
        optionText: 'Test Option Deletion',
        isCorrect: false,
      });
      const savedOption = await newOption.save();
      optionId = savedOption._id;
    });

    it('should delete an option by ID', (done) => {
      request(app)
        .delete(`/options/${optionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('message', 'Az opció sikeresen törölve.');
          done();
        });
    });
  });
});
