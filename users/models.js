const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
  firstname: { type: String, required: true, default: '' },
  lastname: { type: String, required: true, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.methods.serialize = () => ({
  id: this._id,
  firstname: this.firstname || '',
  lastname: this.lastname || '',
  email: this.email || '',
});

userSchema.statics.hashPassword = password => (
  bcrypt.hash(password, 12)
);

userSchema.methods.validatePassword = password => (
  bcrypt.compare(password, this.password)
);

const Users = mongoose.model('User', userSchema);
module.exports = { Users };
