const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const WeaponSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    costGp: {
      type: Number,
      required: true
    },
    class: {
      type: String,
      required: true,
      enum: ['simple', 'martial', 'non-simple'],
    },
    distance: {
      type: String,
      required: false,
      enum: ['melee', 'ranged']
    },
    damageDice: {
      type: String,
      required: true,
      match: /^\d+d\d+$/,
    },
    damageType: {
      type: String,
      required: true,
      enum: ['bludgeoning', 'piercing', 'slashing', 'none'],
    },
    weightLb: {
      type: Number,
      required: true,
      default: 0,
    },
    properties: [{
      type: Schema.Types.ObjectID,
      ref: 'WeaponProperty'
    }],
    rangeFt: String,
    special: String,
    image: {
      type: String,
    }
  }
);

// virtual for url
WeaponSchema.virtual('url').get(function() {
  return `/weapons/${this._id}`;
});

// virtual for category
WeaponSchema.virtual('category').get(function() {
  if (this.class === 'non-simple') {
    return this.distance;
  } else {
    return `${this.class} ${this.distance}`;
  }
});

// damage
// helper function for damage
const parseDamage = (damageDice) => {
  const [numDice, dieType] = damageDice.split('d').map(x => parseInt(x));
  return [numDice, dieType];
};
WeaponSchema.virtual('minDamage').get(function() {
  // min: roll 1 on each die = number of dice
  return parseDamage(this.damageDice)[0];
});
WeaponSchema.virtual('maxDamage').get(function() {
  // max: roll max on each die = number of dice * dice type
  return parseDamage(this.damageDice).reduce((product, val) => product * val, 1);
});
WeaponSchema.virtual('meanDamage').get(function() {
  // mean: roll expected value on each die = expected * numDice
  const [numDice, dieType] = parseDamage(this.damageDice);
  // expected roll for single die = minFace/2 + maxFace/2 because math
  // (https://www.quora.com/What-does-it-mean-that-the-mean-value-of-a-die-is-3-5)
  const expected = 1/2 + dieType/2;
  return numDice * expected;
});

module.exports = mongoose.model('Weapon', WeaponSchema);