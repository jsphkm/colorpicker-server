const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Joi = require('joi');
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
	firstname: {type: String, required: true, default: ''},
	lastname: {type: String, required: true, default: ''},
	email: {type: String, required: true, unique: true},
	password: {type: String, required: true}
});

userSchema.methods.serialize = function() {
	return {
		id: this._id,
		firstname: this.firstname || '',
		lastname: this.lastname || '',
		email: this.email || ''
	};
};

userSchema.statics.hashPassword = function(password) {
	return bcrypt.hash(password, 12);
};

userSchema.methods.validatePassword = function(password) {
	return bcrypt.compare(password, this.password);
};

const userjoiSchema = Joi.object().keys({
	firstname: Joi.string().min(1).trim().required(),
	lastname: Joi.string().min(1).trim().required(),
	email: Joi.string().email().trim().required(),
	password: Joi.string().min(8).max(30).trim().required()
});

const Users = mongoose.model('User', userSchema);
module.exports = {Users, userjoiSchema};