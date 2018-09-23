require('dotenv').config();
const express = require('express');
const cors = require('cors')
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');

const {CLIENT_ORIGIN, PORT, DATABASE_URL} = require('./config');

mongoose.Promise = global.Promise;

const {router: usersRouter} = require('./users');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(cors({
  origin: CLIENT_ORIGIN
}));

app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);

app.use('*', function(req, res){
	res.status(404).json({message: 'Not Found'});
})

let server;

function runServer(databaseUrl, port = PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, {useNewUrlParser: true}, err => {
			if (err) {
				return reject(err);
			}
			server = app.listen(port, () => {
				console.log(`App listening on port ${port}`);
				resolve();
			})
				.on('error', err => {
					mongoose.disconnect();
					reject(err);
				});
		});
	});
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));


module.exports = {app, runServer, closeServer};