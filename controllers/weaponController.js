const Weapon = require('../models/weapon');
const WeaponProperty = require('../models/weaponProperty');

// list all
exports.weaponList = async (req, res) => {
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
}