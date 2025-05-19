import mongoose from 'mongoose';
import { expect } from 'chai';
import { MONGO_URI } from '../../../config.js';
import Quiz from '../../../models/Quiz.js';
import Question from '../../../models/Question.js';
import Option from '../../../models/Option.js';

describe('Quiz Model Unit Tests', () => {
  before((done) => {
    mongoose.connect(MONGO_URI);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      done();
    });
  });

  beforeEach(async () => {
    await Quiz.deleteMany({ title: { $regex: 'Test Quiz' } });
    await Question.deleteMany({ questionText: { $regex: 'Test Question' } });
    await Option.deleteMany({ optionText: { $regex: 'Test Option' } });
  });

  it('should create a new quiz with valid fields, including questionCount', async () => {
    const option1 = new Option({
      optionText: 'Test Option 1',
      isCorrect: true,
    });
    const option2 = new Option({
      optionText: 'Test Option 2',
      isCorrect: false,
    });
    const savedOption1 = await option1.save();
    const savedOption2 = await option2.save();

    const question = new Question({
      questionText: 'Test Question: What is the capital of France?',
      options: [savedOption1._id, savedOption2._id],
    });
    const savedQuestion = await question.save();

    const quiz = new Quiz({
      title: 'Test Quiz: Geography',
      questions: [savedQuestion._id],
      questionCount: 5,
    });
    const savedQuiz = await quiz.save();

    expect(savedQuiz.title).to.equal('Test Quiz: Geography');
    expect(savedQuiz.questions).to.have.lengthOf(1);
    expect(savedQuiz.questions[0].toString()).to.equal(savedQuestion._id.toString());
    expect(savedQuiz.questionCount).to.equal(5);
  });

  it('should fail if title is missing', async () => {
    const quiz = new Quiz({
      questions: [],
      questionCount: 5,
    });
    let error = null;
    try {
      await quiz.save();
    } catch (err) {
      error = err;
    }
    expect(error).to.not.be.null;
    expect(error.errors.title).to.exist;
  });

  it('should fail if questionCount is missing', async () => {
    const quiz = new Quiz({
      title: 'Test Quiz without questionCount',
      questions: [],
    });
    let error = null;
    try {
      await quiz.save();
    } catch (err) {
      error = err;
    }
    expect(error).to.not.be.null;
    expect(error.errors.questionCount).to.exist;
  });

  it('should fail if questionCount is not 5, 10, or 20', async () => {
    const quiz = new Quiz({
      title: 'Test Invalid questionCount Quiz',
      questions: [],
      questionCount: 7,
    });
    let error = null;
    try {
      await quiz.save();
    } catch (err) {
      error = err;
    }
    expect(error).to.not.be.null;
    expect(error.errors.questionCount).to.exist;
  });

  it('should reference saved questions correctly', async () => {
    const option1 = new Option({
      optionText: 'Test Option 1',
      isCorrect: true,
    });
    const option2 = new Option({
      optionText: 'Test Option 2',
      isCorrect: false,
    });
    const savedOption1 = await option1.save();
    const savedOption2 = await option2.save();

    const question = new Question({
      questionText: 'Test Question: What is the capital of Germany?',
      options: [savedOption1._id, savedOption2._id],
    });
    const savedQuestion = await question.save();

    const quiz = new Quiz({
      title: 'Test Quiz: History',
      questions: [savedQuestion._id],
      questionCount: 10,
    });
    const savedQuiz = await quiz.save();

    const foundQuiz = await Quiz.findById(savedQuiz._id).populate({
      path: 'questions',
      populate: { path: 'options' },
    });

    expect(foundQuiz.title).to.equal('Test Quiz: History');
    expect(foundQuiz.questions[0].questionText).to.equal('Test Question: What is the capital of Germany?');
    expect(foundQuiz.questions[0].options[0].optionText).to.equal('Test Option 1');
    expect(foundQuiz.questionCount).to.equal(10);
  });

  after(async () => {
    await Quiz.deleteMany({ title: { $regex: 'Test Quiz' } });
    await Question.deleteMany({ questionText: { $regex: 'Test Question' } });
    await Option.deleteMany({ optionText: { $regex: 'Test Option' } });
    await mongoose.connection.close();
  });
});
