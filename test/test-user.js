const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const { startServer, stopServer, app } = require('../server');
const { Users } = require('../users/models');

const expect = chai.expect;
chai.use(chaiHttp);

function seedUserData(firstnamefaker, lastnamefaker, emailfaker, passwordfaker) {
  return Users.hashPassword(passwordfaker)
    .then(function (hash) {
      return Users.create({
        firstname: firstnamefaker,
        lastname: lastnamefaker,
        email: emailfaker,
        password: hash
      });
    });
};

describe('Integration tests for /api/users', function () {
  const emailfaker = faker.internet.email();
  const passwordfaker = faker.internet.password();
  const firstnamefaker = faker.name.firstName();
  const lastnamefaker = faker.name.lastName();

  before(function () {
    return startServer(true);
  });

  beforeEach(function () {
    return seedUserData(firstnamefaker, lastnamefaker, emailfaker, passwordfaker);
  });

  afterEach(function () {
    return new Promise((resolve, reject) => {
      mongoose.connection.dropDatabase()
        .then(function (result) {
          resolve(result);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  });

  after(function () {
    return stopServer();
  });

  describe('POST', function () {
    it('Should reject user with missing fields', function () {
      return chai.request(app)
      .post('/api/users')
      .type('json')
      .send({
        firstname: firstnamefaker,
        lastname: lastnamefaker,
        email: emailfaker
      })
      .then(res => {
        expect(res).to.have.status(422);
        expect(res.body.reason).to.equal('ValidationError');
        expect(res.body.message).to.equal('Missing field');
        expect(res.body.location).to.equal('password');
      })
    });
    it('Should reject non-string fields', function () {
      return chai.request(app)
      .post('/api/users')
      .send({
        firstname: firstnamefaker,
        lastname: lastnamefaker,
        email: {},
        password: passwordfaker
      })
      .then(res => {
        expect(res).to.have.status(422);
        expect(res.body.reason).to.equal('ValidationError');
        expect(res.body.message).to.equal('Incorrect field type: expected string');
        expect(res.body.location).to.equal('email');
      })
    });
    it('Should reject white-space starting & ending fields', function () {
      return chai.request(app)
      .post('/api/users')
      .send({
        firstname: firstnamefaker,
        lastname: lastnamefaker,
        email: emailfaker,
        password: `    ${faker.internet.password()}     `
      })
      .then(res => {
        expect(res).to.have.status(422);
        expect(res.body.reason).to.equal('ValidationError');
        expect(res.body.message).to.equal('Cannot start or end with whitespace');
        expect(res.body.location).to.equal('password');
      });
    });
    it('Should reject fields with less than required characters', function () {
      return chai.request(app)
      .post('/api/users')
      .send({
        firstname: firstnamefaker,
        lastname: lastnamefaker,
        email: emailfaker,
        password: faker.internet.password(3)
      })
      .then(res => {
        expect(res).to.have.status(422);
        expect(res.body.reason).to.equal('ValidationError');
        expect(res.body.message).to.equal('Must be at least 8 characters long');
        expect(res.body.location).to.equal('password');
      });
    });
    it('Should reject duplicate email', function () {
      return chai.request(app)
      .post('/api/users')
      .send({
        firstname: firstnamefaker,
        lastname: lastnamefaker,
        email: emailfaker,
        password: passwordfaker
      })
      .then(res => {
        expect(res).to.have.status(422);
        expect(res.body.reason).to.equal('ValidationError');
        expect(res.body.message).to.equal('Email is already taken');
        expect(res.body.location).to.equal('email');
      });
    });

    it('Should create a new user', function () {
      const newemail = faker.internet.email();
      const newpassword = faker.internet.password();
      const newfirstname = faker.name.firstName();
      const newlastname = faker.name.lastName();
      return chai
      .request(app)
      .post('/api/users')
      .send({
        firstname: newfirstname,
        lastname: newlastname,
        email: newemail,
        password: newpassword
      })
      .then(res => {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        return Users.findOne({
          email: newemail
        });
      })
      .then(user => {
        expect(user).to.not.be.null;
        expect(user.firstname).to.equal(newfirstname);
        expect(user.lastname).to.equal(newlastname);
        return user.validatePassword(newpassword);
      })
      .then(res => {
        expect(res).to.be.true;
      });
    });
  });
});