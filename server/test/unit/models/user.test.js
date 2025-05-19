import mongoose from 'mongoose';
import { expect } from 'chai';
import { MONGO_URI } from '../../../config.js';
import bcrypt from 'bcrypt';
import User from '../../../models/User.js';

describe('User Model Unit Tests', () => {
  before((done) => {
    mongoose.connect(MONGO_URI);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      done();
    });
  });

  beforeEach(async () => {
    await User.deleteMany({ username: { $regex: 'Test User' } });
  });

  it('should create a new user with valid fields', async () => {
    const user = new User({
      username: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123!',
    });
    const savedUser = await user.save();

    expect(savedUser.username).to.equal('Test User');
    expect(savedUser.email).to.equal('testuser@example.com');
    expect(savedUser.password).to.not.equal('Password123!');
  });

  it('should fail if required fields are missing', async () => {
    const user = new User({});
    let error = null;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }
    expect(error).to.not.be.null;
    expect(error.errors.username).to.exist;
    expect(error.errors.email).to.exist;
    expect(error.errors.password).to.exist;
  });

  it('should hash the password before saving', async () => {
    const user = new User({
      username: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123!',
    });
    const savedUser = await user.save();
    const isMatch = await bcrypt.compare('Password123!', savedUser.password);
    expect(isMatch).to.be.true;
  });

  it('should compare passwords correctly', async () => {
    const user = new User({
      username: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123!',
    });
  
    await user.save();
    
    const isMatch = await user.comparePassword('Password123!');
    expect(isMatch).to.be.true;
  
    const isWrongPassword = await user.comparePassword('wrongpassword');
    expect(isWrongPassword).to.be.false;
  });

  after(async () => {
    await User.deleteMany({ username: { $regex: 'Test User' } });
    await mongoose.connection.close();
  });
});
