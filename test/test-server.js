const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

const should = chai.should();
chai.use(chaiHttp);

describe('API', function() {

  // after(function() {
  //   return closeServer();
  // });

  describe('GET endpoint', function() {
    it('should 200 on GET requests', function() {
      return chai.request(app)
        .get('/api/users')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
        });
    });
  })
});
