import mongoose from 'mongoose';
import { expect } from 'chai';
import { MONGO_URI } from '../../../config.js';
import Request from '../../../models/Request.js';
import User from '../../../models/User.js';

describe('Request Model Unit Tests', () => {
  before((done) => {
    mongoose.connect(MONGO_URI);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      done();
    });
  });

  beforeEach(async () => {
    await Request.deleteMany({ title: { $regex: 'Test Request' } });
    await User.deleteMany({ username: { $regex: 'Test User' } });
  });

  it('should create a new request with valid fields', async () => {
    const user = new User({
      username: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123!',
    });
    const savedUser = await user.save();

    const request = new Request({
      title: 'Test Request: New Quiz',
      user: savedUser._id,
    });

    const savedRequest = await request.save();

    expect(savedRequest.title).to.equal('Test Request: New Quiz');
    expect(savedRequest.user.toString()).to.equal(savedUser._id.toString());
    expect(savedRequest.upvotes).to.have.lengthOf(0);
  });

  it('should fail if title is missing', async () => {
    const user = new User({
      username: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123!',
    });
    const savedUser = await user.save();

    const request = new Request({
      user: savedUser._id,
    });

    let error = null;
    try {
      await request.save();
    } catch (err) {
      error = err;
    }

    expect(error).to.not.be.null;
    expect(error.errors.title).to.exist;
  });

  it('should allow users to upvote a request', async () => {
    const user1 = new User({
      username: 'Test User1',
      email: 'testuser1@example.com',
      password: 'Password123!',
    });
    const user2 = new User({
      username: 'Test User2',
      email: 'testuser2@example.com',
      password: 'Password123!',
    });

    const savedUser1 = await user1.save();
    const savedUser2 = await user2.save();

    const request = new Request({
      title: 'Test Request: New Quiz',
      user: savedUser1._id,
    });

    const savedRequest = await request.save();

    savedRequest.upvotes.push(savedUser2._id);
    const updatedRequest = await savedRequest.save();

    expect(updatedRequest.upvotes).to.have.lengthOf(1);
    expect(updatedRequest.upvotes[0].toString()).to.equal(savedUser2._id.toString());
  });

  it('should reference the user who created the request', async () => {
    const user = new User({
      username: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123!',
    });
    const savedUser = await user.save();

    const request = new Request({
      title: 'Test Request: New Quiz',
      user: savedUser._id,
    });

    const savedRequest = await request.save();

    const foundRequest = await Request.findById(savedRequest._id).populate('user');
    expect(foundRequest.user.username).to.equal('Test User');
  });

  after(async () => {
    await Request.deleteMany({ title: { $regex: 'Test Request' } });
    await User.deleteMany({ username: { $regex: 'Test User' } });
    await mongoose.connection.close();
  });
});
