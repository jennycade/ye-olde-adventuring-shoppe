const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const WeaponPropertySchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 100},
    description: String,
  }
);

module.exports = mongoose.model('WeaponProperty', WeaponPropertySchema);