const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ShopSchema = new Schema({
  name: {
    type: String,
    maxlength: 100,
  },
  weaponsInStock: [{
    type: Schema.Types.ObjectId,
    ref: 'Weapon',
  }],
  armorInStock: [{
    type: Schema.Types.ObjectId,
    ref: 'Armor',
  }],
  description: String,
  image: String,
});

// url
ShopSchema.virtual('url').get(function() {
  return `/shop/${this._id}`;
});

// number of items
ShopSchema.virtual('numItems').get(function() {
  return this.weaponsInStock.length + this.armorInStock.length;
});

module.exports = mongoose.model('Shop', ShopSchema);