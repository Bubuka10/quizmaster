import mongoose from 'mongoose';
import { expect } from 'chai';
import { MONGO_URI } from '../../../config.js';
import Question from '../../../models/Question.js';
import Option from '../../../models/Option.js';

describe('Question Model Unit Tests', () => {
  before((done) => {
    mongoose.connect(MONGO_URI);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      done();
    });
  });

  beforeEach(async () => {
    await Question.deleteMany({ questionText: { $regex: 'Test Question' } });
    await Option.deleteMany({ optionText: { $regex: 'Test Option' } });
  });

  it('should create a new question with valid fields', async () => {
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

    expect(savedQuestion.questionText).to.equal('Test Question: What is the capital of France?');
    expect(savedQuestion.options).to.have.lengthOf(2);
    expect(savedQuestion.options[0].toString()).to.equal(savedOption1._id.toString());
    expect(savedQuestion.options[1].toString()).to.equal(savedOption2._id.toString());
  });

  it('should fail if required fields are missing', async () => {
    const question = new Question({});
    let error = null;
    try {
      await question.save();
    } catch (err) {
      error = err;
    }
    expect(error).to.not.be.null;
    expect(error.errors.questionText).to.exist;
  });

  it('should allow a question with no options', async () => {
    const question = new Question({
      questionText: 'Test Question: What is the capital of France?',
      options: [],
    });
    const savedQuestion = await question.save();

    expect(savedQuestion.questionText).to.equal('Test Question: What is the capital of France?');
    expect(savedQuestion.options).to.have.lengthOf(0);
  });

  it('should reference saved options correctly', async () => {
    const option1 = new Option({
      optionText: 'Test Option 1',
      isCorrect: true,
    });
    const savedOption1 = await option1.save();

    const question = new Question({
      questionText: 'Test Question: What is the capital of Germany?',
      options: [savedOption1._id],
    });
    const savedQuestion = await question.save();

    const foundQuestion = await Question.findById(savedQuestion._id).populate('options');
    expect(foundQuestion.options[0].optionText).to.equal('Test Option 1');
    expect(foundQuestion.options[0].isCorrect).to.be.true;
  });

  after(async () => {
    await Question.deleteMany({ questionText: { $regex: 'Test Question' } });
    await Option.deleteMany({ optionText: { $regex: 'Test Option' } });
    await mongoose.connection.close();
  });
});
