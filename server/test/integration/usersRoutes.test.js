import * as chai from 'chai';
import request from 'supertest';
import { app, server } from '../../index.js';
import User from '../../models/User.js';
import mongoose from 'mongoose';

chai.should();
const { expect } = chai;

describe('Users Routes', () => {
  beforeEach(async () => {
    await User.deleteMany({ username: { $in: ['testuser', 'duplicateuser', 'testuser2', 'testuser3'] } });
  });

  describe('POST /register', () => {
    it('should register a new user with valid fields', async () => {
      const newUser = {
        username: 'testuser',
        password: 'Password123!',
        email: 'testuser@example.com',
      };

      const res = await request(app).post('/users/register').send(newUser);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Sikeres regisztráció');
      expect(res.body).to.have.property('token');
    });

    it('should not register a user with missing fields', async () => {
      const invalidUser = {
        username: '',
        password: '',
        email: '',
      };

      const res = await request(app).post('/users/register').send(invalidUser);
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Minden mező kitöltése kötelező.');
    });

    it('should not register a user with an existing username', async () => {
      const existingUser = {
        username: 'duplicateuser',
        password: 'Password123!',
        email: 'duplicate@example.com',
      };
      await new User(existingUser).save();

      const duplicateUsernameUser = {
        username: 'duplicateuser',
        password: 'NewPassword123!',
        email: 'newuser@example.com',
      };

      const res = await request(app).post('/users/register').send(duplicateUsernameUser);
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Ez a felhasználónév már foglalt.');
    });

    it('should not register a user with a duplicate email', async () => {
      const existingEmailUser = {
        username: 'duplicateuser',
        password: 'Password123!',
        email: 'testuser@example.com',
      };
      await new User(existingEmailUser).save();

      const duplicateEmailUser = {
        username: 'newuser',
        password: 'Password123!',
        email: 'testuser@example.com',
      };

      const res = await request(app).post('/users/register').send(duplicateEmailUser);
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Ez az email cím már regisztrálva van.');
    });

    it('should not register a user with an invalid email format', async () => {
      const invalidEmailUser = {
        username: 'testuser2',
        password: 'Password123!',
        email: 'invalid-email',
      };

      const res = await request(app).post('/users/register').send(invalidEmailUser);
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Az email cím formátuma érvénytelen.');
    });

    it('should not register a user with a weak password', async () => {
      const weakPasswordUser = {
        username: 'testuser3',
        password: 'password',
        email: 'testuser3@example.com',
      };

      const res = await request(app).post('/users/register').send(weakPasswordUser);
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.include('A jelszónak legalább 8 karakter hosszúnak');
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      const user = new User({
        username: 'testuser',
        password: 'Password123!',
        email: 'testuser@example.com',
      });
      await user.save();
    });

    it('should log in an existing user with correct credentials', async () => {
      const credentials = {
        username: 'testuser',
        password: 'Password123!',
      };

      const res = await request(app).post('/users/login').send(credentials);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Sikeres bejelentkezés');
      expect(res.body).to.have.property('token');
    });

    it('should not log in a user with incorrect password', async () => {
      const wrongPassword = {
        username: 'testuser',
        password: 'WrongPassword123!',
      };

      const res = await request(app).post('/users/login').send(wrongPassword);
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Helytelen jelszó');
    });

    it('should not log in a non-existing user', async () => {
      const nonExistentUser = {
        username: 'nonexistent',
        password: 'Password123!',
      };

      const res = await request(app).post('/users/login').send(nonExistentUser);
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Helytelen felhasználónév');
    });
  });

  after(async () => {
    await User.deleteMany({ username: { $in: ['testuser', 'duplicateuser', 'testuser2', 'testuser3'] } });

    server.close();
    await mongoose.connection.close();
  });
});
