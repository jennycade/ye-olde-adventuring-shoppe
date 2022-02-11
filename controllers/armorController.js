const Armor = require('../models/armor');
const armorDefinitions = require('../models/armorDefinitions');

const { body, validationResult } = require('express-validator');

// list all
exports.armorList = async (req, res, next) => {
  try {
    const armor = await Armor.find()
      .sort({name: 1})
      .exec();
    
    // append size to armor name
    const items = armor.map((a) => {
      return {
        name: `${a.name} (${a.size})`,
        url: a.url,
      }
    });

    res.render(
      'list',
      {
        title: 'All armor',
        items,
      }
    );
  } catch (err) {
    return next(err);
  }
};

// get one
exports.armorDetail = async (req, res, next) => {
  try {
    const armor = await Armor.findById(req.params.id).exec();
    // not found?
    if (armor === null) {
      const err = new Error(`Armor not found`);
      err.status = 404;
      return next(err);
    }
    res.render(
      'armorDetail',
      {
        title: armor.name,
        item: armor
      }
    );
  } catch (err) {
    return next(err);
  }
}

// get form to update
exports.updateGet = async(req, res, next) => {
  try {
    const armor = await Armor.findById(req.params.id).exec();
    if (armor === null) {
      const err = new Error(`Armor not found`);
      return next(err);
    }
    
    res.render(
      'armorForm',
      {
        title: `Update ${armor.name}`,
        item: armor,
        armorTypes: armorDefinitions.armorTypes,
        sizes: armorDefinitions.sizes,
      }
    );
  } catch (err) {
    return next(err);
  }
};

// validate
const validationRules = () => {
  return [
    body('name')
      .trim().isLength({min: 1}).escape().withMessage('Name required')
      .isLength({ max: 100 }).withMessage('Name must be less than 100 characters'),
    body('armorType')
      .escape().isIn(armorDefinitions.armorTypes)
      .withMessage('Choose a valid armor type'),
    body('size')
      .escape().isIn(armorDefinitions.sizes)
      .withMessage('Choose a valid size'),
    body('costGp')
      .trim().escape().isFloat({min:0})
      .withMessage('Cost must be a number'),
    body('armorClass')
      .trim().isLength({min: 1}).escape().withMessage('Armor class required')
      .isLength({ max: 100 })
      .withMessage('Armor class must be less than 100 characters'),
    body('minStrength')
      .trim().escape().isFloat({min:0})
      .withMessage('Minimum strength must be a number'),
    body('stealthDisadvantage')
      .escape().isIn(armorDefinitions.stealthDisadvantages)
      .withMessage('Choose a valid option for stealth disadvantage'),
    body('weightLb')
      .trim().escape().isFloat({min:0}).withMessage('Weight must be a number'),
    body('description')
      .trim().escape().optional({checkFalsy: true}),
  ]
};

const processArmorFormData = async (req, res, next) => {
  const isUpdate = !!req.params.id;
  const errors = validationResult(req);

  const armor = new Armor({
    name: req.body.name,
    armorType: req.body.armorType,
    size: req.body.size,
    size: req.body.size,
    costGp: req.body.costGp,
    armorClass: req.body.armorClass,
    minStrength: req.body.minStrength,
    stealthDisadvantage: req.body.stealthDisadvantage,
    weightLb: req.body.weightLb,
    description: req.body.description,
  });

  // add id if it's an update
  if (isUpdate) {
    armor._id = req.params.id;
  }

  if (!errors.isEmpty()) {
    res.render(
      'armorForm',
      {
        title: `Update ${armor.name}`,
        item: armor,
        armorTypes: armorDefinitions.armorTypes,
        sizes: armorDefinitions.sizes,
        errors: errors.array(),
      }
    );
    return;
  } else {
    if (isUpdate) {
      await Armor.findByIdAndUpdate(
        req.params.id,
        armor,
      );
    } else {
      await armor.save((err) => {
        if (err) { return next(err); }
      });
    }
    res.redirect(armor.url);
  }
}

exports.updatePost = [
  validationRules(),
  processArmorFormData,
];

// get form to delete
exports.deleteGet = async(req, res, next) => {
  res.render(
    'layout',
    { title: 'Delete'}
  );
};