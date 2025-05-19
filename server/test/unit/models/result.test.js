import mongoose from 'mongoose';
import { expect } from 'chai';
import { MONGO_URI } from '../../../config.js';
import Result from '../../../models/Result.js';
import User from '../../../models/User.js';
import Quiz from '../../../models/Quiz.js';
import Question from '../../../models/Question.js';
import Option from '../../../models/Option.js';

describe('Result Model Unit Tests', () => {
  let user, quiz, question, option1, option2;

  before((done) => {
    mongoose.connect(MONGO_URI);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      done();
    });
  });

  beforeEach(async () => {
    const testQuizzes = await Quiz.find({ title: { $regex: 'Test Quiz' } }).select('_id');
    const testQuizIds = testQuizzes.map((quiz) => quiz._id);

    await Result.deleteMany({ quiz: { $in: testQuizIds } });
    await User.deleteMany({ username: { $regex: 'Test User' } });
    await Quiz.deleteMany({ title: { $regex: 'Test Quiz' } });
    await Question.deleteMany({ questionText: { $regex: 'Test Question' } });
    await Option.deleteMany({ optionText: { $regex: 'Test Option' } });

    user = new User({
      username: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123!',
    });
    await user.save();

    option1 = new Option({ optionText: 'Test Option 1', isCorrect: true });
    option2 = new Option({ optionText: 'Test Option 2', isCorrect: false });
    await option1.save();
    await option2.save();

    question = new Question({
      questionText: 'Test Question',
      options: [option1._id, option2._id],
    });
    await question.save();

    quiz = new Quiz({
      title: 'Test Quiz',
      questions: [question._id],
      questionCount: 5,
    });
    await quiz.save();
  });

  it('should create a result with valid fields', async () => {
    const result = new Result({
      user: user._id,
      quiz: quiz._id,
      score: 10,
      answers: { [question._id]: option1._id },
      completionTime: 120,
    });

    const savedResult = await result.save();

    expect(savedResult.user.toString()).to.equal(user._id.toString());
    expect(savedResult.quiz.toString()).to.equal(quiz._id.toString());
    expect(savedResult.score).to.equal(10);

    expect(savedResult.answers.get(question._id.toString()).toString()).to.equal(option1._id.toString());
    expect(savedResult.completionTime).to.equal(120);
  });

  it('should fail if required fields are missing', async () => {
    const result = new Result({});

    let error = null;
    try {
      await result.save();
    } catch (err) {
      error = err;
    }

    expect(error).to.not.be.null;
    expect(error.errors.user).to.exist;
    expect(error.errors.quiz).to.exist;
    expect(error.errors.score).to.exist;
    expect(error.errors.completionTime).to.exist;
  });

  it('should reference the user and quiz correctly', async () => {
    const result = new Result({
      user: user._id,
      quiz: quiz._id,
      score: 8,
      answers: { [question._id]: option2._id },
      completionTime: 90,
    });

    await result.save();

    const foundResult = await Result.findById(result._id).populate('user quiz');
    expect(foundResult.user.username).to.equal('Test User');
    expect(foundResult.quiz.title).to.equal('Test Quiz');
  });

  it('should validate selectedQuestions references correctly', async () => {
    const result = new Result({
      user: user._id,
      quiz: quiz._id,
      score: 10,
      answers: { [question._id]: option1._id },
      completionTime: 150,
      selectedQuestions: [question._id],
    });

    const savedResult = await result.save();
    const foundResult = await Result.findById(savedResult._id).populate('selectedQuestions');

    expect(foundResult.selectedQuestions).to.have.lengthOf(1);
    expect(foundResult.selectedQuestions[0].questionText).to.equal('Test Question');
  });

  after(async () => {
    const testQuizzes = await Quiz.find({ title: { $regex: 'Test Quiz' } }).select('_id');
    const testQuizIds = testQuizzes.map((quiz) => quiz._id);

    await Result.deleteMany({ quiz: { $in: testQuizIds } });
    await User.deleteMany({ username: { $regex: 'Test User' } });
    await Quiz.deleteMany({ title: { $regex: 'Test Quiz' } });
    await Question.deleteMany({ questionText: { $regex: 'Test Question' } });
    await Option.deleteMany({ optionText: { $regex: 'Test Option' } });
    await mongoose.connection.close();
  });
});
