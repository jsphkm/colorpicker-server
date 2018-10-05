const express = require('express');
const router = express.Router();
const {Palettes} = require('./models');
const bodyParser = require('body-parser');
const Joi = require('joi');
const {jwtAuth} = require('../auth/strategies');

router.use(bodyParser.json());

router.get('/', jwtAuth, (req, res) => {
  if (req.user){
    Palettes
		.find({user_id: req.user.id})
		.then(palettes => {
      return res.status(200).json(palettes.map(palette => palette.serialize()));
    })
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: 'Internal server error'});
		})
  }
  else {
    res.status(403);
  }
})

router.post('/', jwtAuth, (req, res) => {
  if (req.user) {
    Palettes
    .create({
      user_id: req.user.id,
      colors: req.body.colors
    })
    .then(palette => {
      return res.status(201).json(palette.serialize());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Internal server error'});
    })
  }
  else {
    res.status(403);
  }
});

router.put('/:id', jwtAuth, (req, res) => {
  if (req.user) {
    Palettes
    .findByIdAndUpdate(
      req.params.id,
      {$set: {colors: req.body.colors}}
    )
    .then(updatedPalette => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal Server Error'}));
  }
});

router.delete('/:id', jwtAuth, (req, res) => {
  if (req.user) {
    Palettes
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({message: 'success'});
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Internal Server Error'});
    });
  }
});

module.exports = {router};

