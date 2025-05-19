import * as chai from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import { requireAuth, requireAdmin } from '../../../middleware/auth.js';

chai.should();
const { expect } = chai;

describe('Auth Middleware', () => {
  describe('requireAuth', () => {
    it('should call next if token is valid', () => {
      const req = {
        headers: {
          authorization: 'Bearer validtoken'
        }
      };
      const res = {};
      const next = sinon.spy();
      
      const decodedToken = { id: 'testuser' };
      sinon.stub(jwt, 'verify').returns(decodedToken);

      requireAuth(req, res, next);
      
      expect(next.calledOnce).to.be.true;
      expect(req.user).to.deep.equal(decodedToken);
      jwt.verify.restore();
    });

    it('should return 401 if no token is provided', () => {
      const req = {
        headers: {}
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      const next = sinon.spy();

      requireAuth(req, res, next);

      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ message: 'Hozzáférés megtagadva, hiányzó token. Elvárt formátum: Bearer <token>' })).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should return 401 if token is invalid', () => {
      const req = {
        headers: {
          authorization: 'Bearer invalidtoken'
        }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      const next = sinon.spy();

      sinon.stub(jwt, 'verify').throws();

      requireAuth(req, res, next);

      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ message: 'Érvénytelen token.' })).to.be.true;
      expect(next.called).to.be.false;

      jwt.verify.restore();
    });
  });

  describe('requireAdmin', () => {
    it('should call next if user is admin', () => {
      const req = {
        user: {
          isAdmin: true
        }
      };
      const res = {};
      const next = sinon.spy();

      requireAdmin(req, res, next);

      expect(next.calledOnce).to.be.true;
    });

    it('should return 401 if user is not admin', () => {
      const req = {
        user: {
          isAdmin: false
        }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      const next = sinon.spy();

      requireAdmin(req, res, next);

      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ message: 'Hozzáférés megtagadva, csak adminisztrátorok számára elérhető.' })).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should return 401 if user is undefined', () => {
      const req = {};
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      const next = sinon.spy();

      requireAdmin(req, res, next);

      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ message: 'Hozzáférés megtagadva, csak adminisztrátorok számára elérhető.' })).to.be.true;
      expect(next.called).to.be.false;
    });
  });
});
