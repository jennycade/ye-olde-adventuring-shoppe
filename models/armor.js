const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ArmorSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  armorType: {
    type: String,
    required: true,
    enum: ['light', 'medium', 'heavy', 'shield'],
  },
  size: {
    type: String,
    required: true,
    enum: ['small', 'medium'],
  },
  cost: {
    type: Number,
    required: true,
  },
  armorClass: {
    type: String,
    required: true,
  },
  minStrength: {
    type: Number,
    required: true,
    default: 0,
  },
  stealthDisadvantage: {
    type: Boolean,
    required: true,
    default: false,
  },
  weightLb: {
    type: Number,
    required: true,
  },
  description: String,
  image: String,
});

// url
ArmorSchema.virtual('url').get(function() {
  return `/inventory/armor/${this._id}`;
});

// donning and doffing time - based on armorType
const donningDoffingTimes = {
  'light': {
    don: '1 minute',
    doff: '1 minute',
  },
  'medium': {
    don: '5 minutes',
    doff: '1 minute',
  },
  'heavy': {
    don: '10 minutes',
    doff: '5 minutes',
  },
  'shield': {
    don: '1 action',
    doff: '1 action',
  }
}
ArmorSchema.virtual('donningTime').get(function() {
  return donningDoffingTimes[this.armorType].don;
});
ArmorSchema.virtual('doffingTime').get(function() {
  return donningDoffingTimes[this.armorType].doff;
});

module.exports = mongoose.model('Armor', ArmorSchema);