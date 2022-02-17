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
  customCode: String,
});

// url
ShopSchema.virtual('url').get(function() {
  return `/shops/${this._id}`;
});

// number of items
ShopSchema.virtual('numItems').get(function() {
  return this.weaponsInStock.length + this.armorInStock.length;
});

// display name (if name is blank)
ShopSchema.virtual('displayName').get(function() {
  return this.name || `Shop ${this._id}`;
});

module.exports = mongoose.model('Shop', ShopSchema);