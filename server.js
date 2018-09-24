require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const morgan = require('morgan');

mongoose.Promise = global.Promise;

const {CLIENT_ORIGIN, PORT, DATABASE_URL, TEST_DATABASE_URL} = require('./config');
const {router: usersRouter} = require('./users');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');

const app = express();
passport.use(localStrategy);
passport.use(jwtStrategy);


app.use(morgan('common'));
app.use(cors({
  origin: CLIENT_ORIGIN
}));

app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);

app.use('*', function(req, res){
	res.status(404).json({message: 'Not Found'});
})

let server;

function startServer(testEnv) {
  return new Promise((resolve, reject) => {
    let databaseUrl;
    if (testEnv) {
      databaseUrl = TEST_DATABASE_URL;
    }
    else {
      databaseUrl = DATABASE_URL;
    }
    mongoose.connect(databaseUrl, {useNewUrlParser: true, useCreateIndex: true}, err => {
      if (err) {
        return reject(err);
      }
      else {
        server = app.listen(PORT, () => {
          console.log(`Express server is listening on port ${PORT}`);
          resolve();
        })
        .on('error', err => {
          monoose.disconnect();
          reject(err);
        });
      }
    });
  });
}

function stopServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        else {
          resolve();
        }
      });
    });
  });
}

module.exports = {app, startServer, stopServer};