const async = require('async');
const { body, validationResult } = require('express-validator');

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

// helper - get weaponProperties the same way every time for forms!
const getWeaponProperties = async () => {
  const weapons = await WeaponProperty.find().sort('name').exec();
  return weapons;
}

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
    
    const weaponProperties = await getWeaponProperties();

    // make the form
    const formData = convertDocToFormData(weapon, weaponProperties);
    res.render(
      'weaponForm',
      {
        title: `Update ${weapon.name}`,
        weapon: formData,
        weaponDefinitions: require('../models/weaponDefinitions'),
      }
    )

  } catch (err) {
    return next(err);
  }
};

// helper - form -> db
const convertPropertiesToArray = (req, res, next) => {
  // properties -> array
  if (!(req.body.properties instanceof Array)) {
    if (typeof req.body.properties === 'undefined') {
      req.body.properties = [];
    } else {
      req.body.properties = new Array(req.body.properties);
    }
  }
  next();
}

// validate
const weaponDefinitions = require('../models/weaponDefinitions');
const validationRules = () => {
  return [
    body('name')
      .trim().isLength({ min: 1}).escape().withMessage('Name required')
      .isLength({ max: 100}).withMessage('Name must be less than 100 characters'),
    body('costGp')
      .trim().escape().isFloat({min: 0}).withMessage('Cost must be a number'),
    body('class')
      .escape().isIn(weaponDefinitions.classes).withMessage('Choose a valid weapon class'),
    body('distance')
      .escape().isIn(weaponDefinitions.distances).withMessage('Choose a valid weapon distance'),
    body('range')
      .trim().escape().optional({checkFalsy: true}),
    body('damageDice')
      .trim().isLength({ min: 1}).escape().withMessage('Damage dice required')
      .matches(/^\d+d\d+$/).withMessage('Damage dice must match format (#)d(#)'),
    body('damageType')
      .escape().isIn(weaponDefinitions.damageTypes).withMessage('Choose a valid damage type'),
    body('weightLb')
      .trim().escape().isFloat({min:0}).withMessage('Weight must be a number'),
    body('properties.*').escape(),
    body('special')
      .trim().escape().optional({checkFalsy: true}),
  ];
}

const processWeaponFormData = async (req, res, next) => {
  const isUpdate = !!req.params.id
  const errors = validationResult(req);

  const weapon = new Weapon({
    name: req.body.name,
    costGp: req.body.costGp,
    class: req.body.class,
    rangeFt: req.body.rangeFt,
    distance: req.body.distance,
    damageDice: req.body.damageDice,
    damageType: req.body.damageType,
    weightLb: req.body.weightLb,
    special: req.body.special,
  });

  // if it's an update, add the id
  if (isUpdate) {
    weapon._id = req.params.id;
  }

  if (!errors.isEmpty()) {
    // re-render the form

    // get weapon and weapon properties
    const weaponProperties = await getWeaponProperties();

    // make the form
    const formData = convertDocToFormData(weapon, weaponProperties);
    res.render(
      'weaponForm',
      {
        title: `Update ${weapon.name}`,
        weapon: formData,
        weaponDefinitions: require('../models/weaponDefinitions'),
        errors: errors.array(),
        properties: (typeof req.body.properties === 'undefined' ? [] : req.body.properties),
      }
    );
    return;
  } else {
    // valid, save and redirect
    if (isUpdate) {
      await Weapon.findByIdAndUpdate(
        req.params.id,
        weapon,
      );
    } else {
      await weapon.save((err) => { return next(err); });
    }
    // redirect
    res.redirect(weapon.url);
  }
}

// process update form
exports.updatePost = [
  convertPropertiesToArray,
  validationRules(),
  processWeaponFormData,
];

// get form to delete
exports.deleteGet = async(req, res, next) => {
  res.render(
    'layout',
    { title: 'Delete'}
  );
};