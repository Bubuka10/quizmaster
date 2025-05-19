import * as chai from 'chai';
import request from 'supertest';
import { app } from '../../index.js';
import Quiz from '../../models/Quiz.js';
import User from '../../models/User.js';
import Question from '../../models/Question.js';
import Option from '../../models/Option.js';

chai.should();
const { expect } = chai;

describe('Quizzes Routes', () => {
  let adminToken;
  let adminUserId;
  let allQuestions;
  let quizId;

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

    const questions = [
      {
        questionText: 'Test Question 1',
        options: [
          { optionText: 'Option 1', isCorrect: true },
          { optionText: 'Option 2', isCorrect: false },
          { optionText: 'Option 3', isCorrect: false },
          { optionText: 'Option 4', isCorrect: false },
        ],
      },
      {
        questionText: 'Test Question 2',
        options: [
          { optionText: 'Option 1', isCorrect: false },
          { optionText: 'Option 2', isCorrect: true },
          { optionText: 'Option 3', isCorrect: false },
          { optionText: 'Option 4', isCorrect: false },
        ],
      },
      {
        questionText: 'Test Question 3',
        options: [
          { optionText: 'Option 1', isCorrect: false },
          { optionText: 'Option 2', isCorrect: false },
          { optionText: 'Option 3', isCorrect: true },
          { optionText: 'Option 4', isCorrect: false },
        ],
      },
      {
        questionText: 'Test Question 4',
        options: [
          { optionText: 'Option 1', isCorrect: false },
          { optionText: 'Option 2', isCorrect: false },
          { optionText: 'Option 3', isCorrect: false },
          { optionText: 'Option 4', isCorrect: true },
        ],
      },
      {
        questionText: 'Test Question 5',
        options: [
          { optionText: 'Option 1', isCorrect: true },
          { optionText: 'Option 2', isCorrect: false },
          { optionText: 'Option 3', isCorrect: false },
          { optionText: 'Option 4', isCorrect: false },
        ],
      },
      {
        questionText: 'Test Question 6',
        options: [
          { optionText: 'Option 1', isCorrect: false },
          { optionText: 'Option 2', isCorrect: true },
          { optionText: 'Option 3', isCorrect: false },
          { optionText: 'Option 4', isCorrect: false },
        ],
      },
      {
        questionText: 'Test Question 7',
        options: [
          { optionText: 'Option 1', isCorrect: true },
          { optionText: 'Option 2', isCorrect: false },
          { optionText: 'Option 3', isCorrect: false },
          { optionText: 'Option 4', isCorrect: false },
        ],
      },
      {
        questionText: 'Test Question 8',
        options: [
          { optionText: 'Option 1', isCorrect: false },
          { optionText: 'Option 2', isCorrect: false },
          { optionText: 'Option 3', isCorrect: true },
          { optionText: 'Option 4', isCorrect: false },
        ],
      },
      {
        questionText: 'Test Question 9',
        options: [
          { optionText: 'Option 1', isCorrect: false },
          { optionText: 'Option 2', isCorrect: false },
          { optionText: 'Option 3', isCorrect: false },
          { optionText: 'Option 4', isCorrect: true },
        ],
      },
      {
        questionText: 'Test Question 10',
        options: [
          { optionText: 'Option 1', isCorrect: true },
          { optionText: 'Option 2', isCorrect: false },
          { optionText: 'Option 3', isCorrect: false },
          { optionText: 'Option 4', isCorrect: false },
        ],
      },
    ];

    const savedQuestions = [];
    for (const question of questions) {
      const options = await Option.insertMany(question.options);
      const questionToSave = new Question({
        questionText: question.questionText,
        options: options,
      });
      const savedQuestion = await questionToSave.save();
      savedQuestions.push(savedQuestion);
    }
    allQuestions = savedQuestions;

    const newQuiz = {
      title: 'Test Quiz with 5 Questions',
      questions: allQuestions,
      questionCount: 5,
    };

    const quizResponse = await request(app)
      .post('/quizzes/add')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newQuiz);

    quizId = quizResponse.body._id;
  });

  after(async () => {
    await Quiz.deleteMany({ title: { $regex: 'Test Quiz' } });
    await Question.deleteMany({ questionText: { $regex: 'Test Question' } });
    await Option.deleteMany({ optionText: { $regex: 'Option' } });
    await User.findByIdAndDelete(adminUserId);
  });

  describe('GET /quizzes/:id', () => {
    it('should retrieve a quiz by ID', (done) => {
      request(app)
        .get(`/quizzes/${quizId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('title', 'Test Quiz with 5 Questions');
          expect(res.body).to.have.property('questionCount', 5);
          done();
        });
    });
  });

  describe('PUT /quizzes/:id', () => {
    it('should update a quiz by ID', (done) => {
      request(app)
        .get(`/quizzes/${quizId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .end((err, res) => {
          if (err) return done(err);

          const existingQuiz = res.body;
          existingQuiz.title = 'Updated Test Quiz';
          existingQuiz.questionCount = 5;

          request(app)
            .put(`/quizzes/${quizId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(existingQuiz)
            .end((err, res) => {
              if (err) return done(err);

              expect(res.status).to.equal(200);
              expect(res.body).to.have.property('title', 'Updated Test Quiz');
              expect(res.body).to.have.property('questionCount', 5);
              done();
            });
        });
    });
  });

  describe('DELETE /quizzes/:id', () => {
    it('should delete a quiz by ID', (done) => {
      request(app)
        .delete(`/quizzes/${quizId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property(
            'message',
            'A kvízt és a hozzá tartozó adatokat sikeresen töröltük.'
          );
          done();
        });
    });
  });
});
