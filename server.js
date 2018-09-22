const express = require('express');
const cors = require('cors')
const app = express();
const {CLIENT_ORIGIN, PORT, DATABASE_URL} = require('./config');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

app.use(cors({
  origin: CLIENT_ORIGIN
}))

app.get('/api/*', (req, res) => {
  res.json({ok: true});
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));


module.exports = {app};