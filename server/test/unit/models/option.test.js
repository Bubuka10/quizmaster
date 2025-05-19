import mongoose from 'mongoose';
import { expect } from 'chai';
import { MONGO_URI } from '../../../config.js';
import Option from '../../../models/Option.js';

describe('Option Model Unit Tests', () => {
  before((done) => {
    mongoose.connect(MONGO_URI);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      done();
    });
  });

  beforeEach(async () => {
    await Option.deleteMany({ optionText: { $regex: 'Test Option' } });
  });

  it('should create a new option with valid fields', async () => {
    const option = new Option({
      optionText: 'Test Option Valid',
      isCorrect: true,
    });
    const savedOption = await option.save();

    expect(savedOption.optionText).to.equal('Test Option Valid');
    expect(savedOption.isCorrect).to.be.true;
  });

  it('should fail if required fields are missing', async () => {
    const option = new Option({});
    let error = null;
    try {
      await option.save();
    } catch (err) {
      error = err;
    }
    expect(error).to.not.be.null;
    expect(error.errors.optionText).to.exist;
    expect(error.errors.isCorrect).to.exist;
  });

  it('should fail if optionText is missing', async () => {
    const option = new Option({
      isCorrect: false,
    });
    let error = null;
    try {
      await option.save();
    } catch (err) {
      error = err;
    }
    expect(error).to.not.be.null;
    expect(error.errors.optionText).to.exist;
  });

  it('should fail if isCorrect is missing', async () => {
    const option = new Option({
      optionText: 'Test Option Missing isCorrect',
    });
    let error = null;
    try {
      await option.save();
    } catch (err) {
      error = err;
    }
    expect(error).to.not.be.null;
    expect(error.errors.isCorrect).to.exist;
  });

  after(async () => {
    await Option.deleteMany({ optionText: { $regex: 'Test Option' } });
    await mongoose.connection.close();
  });
});
