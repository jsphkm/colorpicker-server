const express = require('express');
const router = express.Router();
const {Users, userjoiSchema} = require('./models');
const bodyParser = require('body-parser');
const Joi = require('joi');
router.use(bodyParser.json());
const {jwtAuth} = require('../auth/strategies');

router.get('/', jwtAuth, (req, res) => {
  if (req.user){
    Users
		.findById(req.user.id)
		.then(user => res.json(
      {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email
      }
    ))
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: 'Internal server error'});
		})
  }
  else {
    res.status(403);
  }
})

router.post('/', (req, res) => {
  const newUser = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password
  }

  const validation = Joi.validate(newUser, userjoiSchema);
  if (validation.error) {
    return res.status(422).json({error: validation.error});
  }

  return Users
    .findOne({email: req.body.email})
    .then(count => {
      if (count) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Email is already taken',
          location: 'email'
        });
      }
      return Users.hashPassword(req.body.password);
    })
    .then(hash => {
      return Users.create({
				firstname: req.body.firstname.trim(),
				lastname: req.body.lastname.trim(),
				email: req.body.email,
        password: hash
      });
    })
    .then(createdUser => {
      return res.status(201).json(createdUser.serialize());
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

router.delete('/', jwtAuth, (req, res) => {
  if (req.user){
    Users
		.findByIdAndRemove(req.user.id)
		.then(() => {
			res.status(204).json({message: 'success'});
		})
		.catch(err => {
			res.status(500).json({error: 'Internal Server Error'});
		});
  }
});

router.put('/:id', jwtAuth, (req, res) => {
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)){
		res.status(400).json({
			error: 'Request path id and request body id values must match'
		});
	}

	const updated = {};
	const updateableFields = ['firstname', 'lastname', 'email', 'password'];
	updateableFields.forEach(field => {
		if (field in req.body) {
			updated[field] = req.body[field];
		}
	});

	Users
		.findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
		.then(updatedUser => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

module.exports = {router};