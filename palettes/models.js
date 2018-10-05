const mongoose = require('mongoose');
const Joi = require('joi');

const palettesSchema = new mongoose.Schema({
  user_id: {type: String, default: ''},
  colors: [{
    hue: {type: Number, min: 0, max: 255, default: 255},
    saturation: {type: Number, min: 0, max: 255, default: 255},
    lightness: {type: Number, min: 0, max: 255, default: 255}
  }]
});

palettesSchema.methods.serialize = function() {
	return {
    user_id: this.user_id,
    id: this._id,
    colors: this.colors
	};
};

const Palettes = mongoose.model('palette', palettesSchema);
module.exports = {Palettes, palettesSchema};