const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const armorDefinitions = require('./armorDefinitions');

const ArmorSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  armorType: {
    type: String,
    required: true,
    enum: armorDefinitions.armorTypes,
  },
  size: {
    type: String,
    required: true,
    enum: armorDefinitions.sizes,
  },
  costGp: {
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
  return `/armor/${this._id}`;
});

// virtual for display name
ArmorSchema.virtual('displayName').get(function() {
  return `${this.name} (${this.size})`;
});


// donning and doffing time - based on armorType
ArmorSchema.virtual('donningTime').get(function() {
  return armorDefinitions.donningDoffingTimes[this.armorType].don;
});
ArmorSchema.virtual('doffingTime').get(function() {
  return armorDefinitions.donningDoffingTimes[this.armorType].doff;
});

module.exports = mongoose.model('Armor', ArmorSchema);