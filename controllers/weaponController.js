const Weapon = require('../models/weapon');
const WeaponProperty = require('../models/weaponProperty');

// list all
exports.weaponList = async (req, res, next) => {
  try {
    const weapons = await Weapon.find()
      .sort({name: 1})
      .populate('properties')
      .exec();
    res.render(
      'weaponList',
      {
        title: 'All weapons',
        weapons,
      }
    );
  } catch (err) {
    return next(err);
  }
}

// get one
exports.weaponDetail = async (req, res, next) => {
  try {
    const weapon = await Weapon.findById(req.params.id)
      .populate('properties')
      .exec();
    // not found?
    if (weapon === null) {
      const err = new Error(`Weapon not found`);
      err.status = 404;
      return next(err);
    }
    res.render(
      'weaponDetail.pug',
      {
        title: weapon.name,
        weapon,
      }
    )

  } catch (err) {
    return next(err);
  }
}