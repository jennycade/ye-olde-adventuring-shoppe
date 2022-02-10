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
      'list',
      {
        title: 'All weapons',
        items: weapons,
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
      'weaponDetail',
      {
        title: weapon.name,
        item: weapon,
      }
    )

  } catch (err) {
    return next(err);
  }
}

// helpers
// db entry -> form
const convertDocToFormData = (weapon, weaponProperties) => {
  const formData = {
    name: weapon.name,
    costGp: weapon.costGp,
    class: weapon.class,
    distance: weapon.distance,
    damageDice: weapon.damageDice,
    damageType: weapon.damageType,
    weightLb: weapon.weightLb,
    rangeFt: weapon.rangeFt,
    special: weapon.special,
    image: weapon.image,
  };
  const props = weaponProperties.map(prop => {
    return {
      _id: prop._id,
      name: prop.name,
      checked: weapon.properties.includes(prop._id)
    }
  });

  formData.properties = props;
  return formData;
};

// get form to update
exports.updateGet = async (req, res, next) => {
  try {
    // get the data
    const weapon = await Weapon.findById(req.params.id).exec();
    if (weapon === null) {
      const err = new Error(`Weapon not found`);
      err.status = 404
      return next(err);
    }
    const weaponProperties = await WeaponProperty.find().sort('name').exec();

    // make the form
    const formData = convertDocToFormData(weapon, weaponProperties);
    res.render(
      'weaponForm',
      {
        title: `Update ${weapon.name}`,
        weapon: formData
      }
    )

  } catch (err) {
    return next(err);
  }
};

// get form to delete
exports.deleteGet = async(req, res, next) => {
  res.render(
    'layout',
    { title: 'Delete'}
  );
};