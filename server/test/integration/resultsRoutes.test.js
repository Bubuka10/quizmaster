import * as chai from 'chai';
import request from 'supertest';
import { app } from '../../index.js';
import User from '../../models/User.js';
import Result from '../../models/Result.js';
import Quiz from '../../models/Quiz.js';
import Question from '../../models/Question.js';
import Option from '../../models/Option.js';

chai.should();
const { expect } = chai;

describe('Results Routes', () => {
  let userToken;
  let userId;
  let quizId;
  let questionIds = [];
  let optionIds = [];

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

    const questions = [
      {
        questionText: 'Question 1',
        options: [
          { optionText: 'Answer 1', isCorrect: true },
          { optionText: 'Answer 2', isCorrect: false }
        ]
      },
      {
        questionText: 'Question 2',
        options: [
          { optionText: 'Answer 3', isCorrect: false },
          { optionText: 'Answer 4', isCorrect: true }
        ]
      },
      {
        questionText: 'Question 3',
        options: [
          { optionText: 'Answer 5', isCorrect: true },
          { optionText: 'Answer 6', isCorrect: false }
        ]
      },
      {
        questionText: 'Question 4',
        options: [
          { optionText: 'Answer 7', isCorrect: false },
          { optionText: 'Answer 8', isCorrect: true }
        ]
      },
      {
        questionText: 'Question 5',
        options: [
          { optionText: 'Answer 9', isCorrect: true },
          { optionText: 'Answer 10', isCorrect: false }
        ]
      }
    ];

    for (const question of questions) {
      const savedOptions = [];
      for (const option of question.options) {
        const newOption = new Option({
          optionText: option.optionText,
          isCorrect: option.isCorrect,
        });
        const savedOption = await newOption.save();
        optionIds.push(savedOption._id);
        savedOptions.push(savedOption._id);
      }

      const newQuestion = new Question({
        questionText: question.questionText,
        options: savedOptions,
      });
      const savedQuestion = await newQuestion.save();
      questionIds.push(savedQuestion._id);
    }

    const quiz = new Quiz({
      title: 'Test Quiz',
      questions: questionIds,
      questionCount: 5,
    });
    const savedQuiz = await quiz.save();
    quizId = savedQuiz._id;
  });

  after(async () => {
    await User.findByIdAndDelete(userId);
    await Result.deleteMany({ user: userId });
    await Quiz.findByIdAndDelete(quizId);
    await Question.deleteMany({ _id: { $in: questionIds } });
    await Option.deleteMany({ _id: { $in: optionIds } });
  });

  describe('POST /results/quiz/:quizId', () => {
    it('should add a new result with valid data, without answers', (done) => {
      const newResult = {
        score: 80,
        completionTime: 120,
      };

      request(app)
        .post(`/results/quiz/${quizId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(newResult)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body).to.have.property('score', 80);
          expect(res.body).to.have.property('completionTime', 120);
          done();
        });
    });
  });

  describe('GET /results/user/:userId', () => {
    it('should retrieve all results for the user', (done) => {
      request(app)
        .get(`/results/user/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.be.greaterThan(0);
          expect(res.body[0]).to.have.property('score', 80);
          done();
        });
    });

    it('should not allow other users to access these results', (done) => {
        const unauthorizedUser = new User({
          username: 'unauthorizeduser',
          password: 'Password123!',
          email: 'unauthorizeduser@example.com',
        });
      
        unauthorizedUser.save()
          .then((savedUnauthorizedUser) => {
            request(app)
              .post('/users/login')
              .send({ username: 'unauthorizeduser', password: 'Password123!' })
              .end((err, loginRes) => {
      
                const unauthorizedToken = loginRes.body.token;
      
                request(app)
                  .get(`/results/user/${userId}`)
                  .set('Authorization', `Bearer ${unauthorizedToken}`)
                  .end((err, res) => {

                    expect(res.status).to.equal(403);
                    expect(res.body).to.have.property('error', 'Hozzáférés megtagadva.');
      
                    User.findByIdAndDelete(savedUnauthorizedUser._id)
                      .then(() => done());
                  });
              });
          })
          .catch((saveErr) => {
            console.log('Save Error:', saveErr);
            done(saveErr);
          });
      });      
  });

  describe('GET /results/quiz/:quizId', () => {
    it('should retrieve all results for a quiz', (done) => {
      request(app)
        .get(`/results/quiz/${quizId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array');
          if (res.body.length > 0) {
            expect(res.body[0]).to.have.property('score', 80);
          }
          done();
        });
    });
  });
});
