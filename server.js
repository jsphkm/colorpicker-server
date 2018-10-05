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
const {router: palettesRouter} = require('./palettes');

const app = express();
app.use(express.json());
passport.use(localStrategy);
passport.use(jwtStrategy);
app.options('*', cors());


app.use(morgan('dev'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/palettes', palettesRouter);

app.use('*', function(req, res){
	res.status(404).json({error: 'Not Found'});
});

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
        console.error(err);
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
          console.log('Express server shut down');
          resolve();
        }
      });
    });
  });
}

module.exports = {app, startServer, stopServer};