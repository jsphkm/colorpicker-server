const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const config = require('../config');
const router = express.Router();

const {localAuth, jwtAuth} = require('./strategies');

const createAuthToken = function(user) {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.email,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

router.use(bodyParser.json());
router.post('/login', localAuth, (req, res) => {
  const user = req.user.serialize();
  const authToken = createAuthToken(user);
  res.json({authToken, user});
});

router.post('/refresh', jwtAuth, (req, res) => {
  const user = req.user;
  const authToken = createAuthToken(user);
  res.json({authToken, user});
});

module.exports = {router};