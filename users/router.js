const express = require('express');
const router = express.Router();
const {Users} = require('./models');
const passport = require('passport');

const jwtAuth = passport.authenticate('jwt', { session: false });


router.get('/', jwtAuth, (req, res) => {
  if (req.user){
    Users
		.findById(req.user.id)
		.then(post => res.json(
      {
        firstname: post.firstname,
        lastname: post.lastname,
        email: post.email
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
	const requiredFields = ['firstname', 'lastname', 'email', 'password'];
	const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    console.log('before missing field')
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
	}
	
	const stringFields = ['firstName', 'lastName', 'email', 'password'];
	const nonStringField = stringFields.find(field => 
		field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    console.log('before incorrect field');
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }
	
	const explicityTrimmedFields = ['email', 'password'];
  let nonTrimmedField = explicityTrimmedFields.find(
    field => {
      if (req.body[field].trim() !== req.body[field]) {
        return field;
      }
    }
  );

  if (nonTrimmedField) {
    console.log('before whitespace');
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
	}
	
	const sizedFields = {
    firstname: {
      min: 1
		},
		lastname: {
			min: 1
		},
    password: {
      min: 8,
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field => {
      if ('min' in sizedFields[field] && req.body[field].trim().length < sizedFields[field].min){
        return field;
      }
    }
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field => {
      if ('max' in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max){
        return field;
      }
    }
	);
	
	if (tooSmallField || tooLargeField) {
    console.log('before at least');
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
	}
	
	//let {email, password, firstname, lastname} = req.body;
  // firstname = req.body.firstname.trim();
	// lastname = req.body.lastname.trim();

  return Users
    .findOne({email: req.body.email})
    .then(count => {
      if (count) {
        console.log('before duplicate');
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
      console.log('before create');
      return Users.create({
				firstname: req.body.firstname.trim(),
				lastname: req.body.lastname.trim(),
				email: req.body.email,
        password: hash
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

router.delete('/', (req, res) => {
  if (req.user){
    Users
		.findByIdAndRemove(req.user.id)
		.then(() => {
			res.status(204).json({message: 'success'});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({error: 'Internal Server Error'});
		});
  }
});

router.put('/:id', (req, res) => {
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