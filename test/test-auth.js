// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const jwt = require('jsonwebtoken');
// const faker = require('faker');
// const mongoose = require('mongoose');
// const expect = chai.expect;
// chai.use(chaiHttp);

// const {Users} = require('../users/models');
// const {app, runServer, closeServer} = require('../server');
// const {JWT_SECRET, TEST_DATABASE_URL} = require('../config');

// function seedLoginData(firstnamefaker, lastnamefaker, emailfaker, passwordfaker) {
//   return Users.hashPassword(passwordfaker)
//   .then(hash => {
//     return Users.create({
//       firstname: firstnamefaker,
//       lastname: lastnamefaker,
//       email: emailfaker,
//       password: hash
//     });
//   })
// }

// function generateLoginData() {
//   return {
//     firstnamefaker: faker.name.firstName(),
//     lastnamefaker: faker.name.lastName(),
//     emailfaker: faker.internet.email(),
//     passwordfaker: faker.internet.password()
//   };
// }

// function tearDownDb() {
//   console.warn('Deleting database');
//   return mongoose.connection.dropDatabase();
// }


// describe('Auth endpoints', function() {
//   const {firstnamefaker, lastnamefaker, emailfaker, passwordfaker} = generateLoginData();

//   // before(function() {
//   //   return runServer(TEST_DATABASE_URL);
//   // });

//   // beforeEach(function() {
//   //   return seedLoginData(firstnamefaker, lastnamefaker, emailfaker, passwordfaker);
//   // });

//   // afterEach(function() {
//   //   return tearDownDb();
//   // });

//   // after(function() {
//   //   return closeServer();
//   // });

//   describe('/api/auth/login', function() {
//     it('should reject requests with invalid credentials', function() {
//       return chai.request(app)
//         .post('/api/auth/login')
//         .send({username: '', password: ''})
//         .then(res => {
//           expect(res).to.have.status(400);
//         })
//     });
//     it('should reject requests with invalid emails', function() {
//       return chai.request(app)
//         .post('/api/auth/login')
//         .send({username: 'invalidemail', password: passwordfaker})
//         .then(res => {
//           expect(res).to.have.status(401);
//         });
//     });
//     it('should reject requests with invalid passwords', function() {
//       return chai.request(app)
//         .post('/api/auth/login')
//         .send({username: emailfaker, password: 'invalidpassword'})
//         .then(res => {
//           expect(res).to.have.status(401);
//         });
//     });
//     it('should return an auth token', function() {
//       return chai.request(app)
//         .post('/api/auth/login')
//         .send({username: emailfaker, password: passwordfaker})
//         .then(res => {
//           expect(res).to.have.status(200);
//           expect(res.body).to.be.an('object');
//           const token = res.body.authToken;
//           expect(token).to.be.a('string');
//           const payload = jwt.verify(token, JWT_SECRET, {
//             algorithm: ['HS256']
//           });
//         })
//     })
//   })
// })