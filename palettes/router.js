const express = require('express');

const router = express.Router();
const bodyParser = require('body-parser');
const { Palettes } = require('./models');
const { jwtAuth } = require('../auth/strategies');

router.use(bodyParser.json());

router.get('/:id', jwtAuth, (req, res) => {
  if (req.user) {
    Palettes
      .findById(req.params.id)
      .then((palette) => {
        return res.status(200).json(palette.serialize());
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      });
  } else {
    return res.status(403).end();
  }
});

router.get('/', jwtAuth, (req, res) => {
  if (req.user) {
    Palettes
      .find({ user_id: req.user.id })
      .sort({ updatedDate: 'desc' })
      .then((palettes) => res.status(200).json(palettes.map(palette => palette.serialize())))
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      });
  } else {
    return res.status(403).end();
  }
});

router.post('/', jwtAuth, (req, res) => {
  if (req.user) {
    Palettes
      .create({
        user_id: req.user.id,
        colors: req.body.colors,
      })
      .then((palette) => res.status(201).json(palette.serialize()))
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      });
  } else {
    return res.status(403).end();
  }
});

router.put('/:id', jwtAuth, (req, res) => {
  if (req.user) {
    Palettes
      .findByIdAndUpdate(
        req.params.id,
        { $set: { colors: req.body.colors } },
      )
      .then(() => res.status(204).end())
      .catch(() => res.status(500).json({ message: 'Internal Server Error' }));
  }
});

router.delete('/:id', jwtAuth, (req, res) => {
  if (req.user) {
    Palettes
      .findByIdAndRemove(req.params.id)
      .then(() => {
        res.status(204).json({ message: 'success' });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      });
  }
});

module.exports = { router };
