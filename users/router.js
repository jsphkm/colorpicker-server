const express = require('express');
const router = express.Router();
const {Users} = require('./models');
const bodyParser = require('body-parser');
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
			res.status(500).json({ error: 'Internal server error'});
		})
  }
  else {
    res.status(403);
  }
})

router.post('/', (req, res) => {
  const fields = ['firstname', 'lastname', 'email', 'password'];
  const missingField = fields.find(field => !(field in req.body));
  if (missingField) {
    return res.status(422).json({
      code: 422, reason: 'ValidationError',
      message: 'Missing field', location: missingField
    });
  };
  const nonStringField = fields.find(field =>
    field in req.body && typeof req.body[field] !== 'string'
    );
  if (nonStringField) {
    return res.status(422).json({
      code: 422, reason: 'ValidationError',
      message: 'Incorrect field type: expected string', location: nonStringField
    });
  };
  const nonTrimmedFields = fields.find(field => {
    if(req.body[field].trim() !== req.body[field]) {
      return field;
    };
  });
  if (nonTrimmedFields) {
    return res.status(422).json({
      code: 422, reason: 'ValidationError',
      message: 'Cannot start or end with whitespace', location: nonTrimmedFields
    });
  };
  const fieldlens = {
    firstname: {min: 1},
    lastname: {min: 1},
    email: {min: 1},
    password: {min: 8, max: 72}
  }
  const tooshort = Object.keys(fieldlens).find(field => {
    if ('min' in fieldlens[field] && req.body[field].trim().length < fieldlens[field].min) {
      return field;
    }
  });
  const toolong = Object.keys(fieldlens).find(field => {
    if ('max' in fieldlens[field] && req.body[field].trim().length > fieldlens[field].max) {
      return field;
    }
  });
  if (tooshort || toolong) {
    return res.status(422).json({
      code: 422, reason: 'ValidationError',
      message: tooshort ? `Must be at least ${fieldlens[tooshort].min} characters long`
      : `Must be at most ${fieldlens[toolong].max} characters long`,
      location: tooshort || toolong
    });
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