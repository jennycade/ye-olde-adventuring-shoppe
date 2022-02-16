const Armor = require('../models/armor');
const Shop = require('../models/shop');
const armorDefinitions = require('../models/armorDefinitions');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

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

const createArmorObj = (req = null, id = null) => {
  let armor;
  if (req) {
    // handle form data
    armor = new Armor({
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
    if (id) {
      armor._id = id;
    }
  } else {
    // create new
    armor = new Armor({
      name: '',
      armorType: undefined,
      size: undefined,
      size: undefined,
      costGp: '',
      armorClass: '',
      minStrength: 0,
      stealthDisadvantage: '',
      weightLb: '',
      description: '',
    });
  }
  return armor;
}

const processArmorFormData = async (req, res, next) => {
  const isUpdate = !!req.params.id;
  const errors = validationResult(req);

  const armor = createArmorObj(req, req.params.id);

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
      res.redirect(armor.url);
    } else {
      await armor.save((err) => {
        if (err) { return next(err); }
      });
      res.redirect(armor.url);
    }
  }
}

exports.updatePost = [
  validationRules(),
  processArmorFormData,
];

const findShopsWithItem = async (armorId) => {
  const shopsWithItem = await Shop.find(
    { armorInStock: armorId },
    'name url displayName'
  ).exec();
  return shopsWithItem;
}

// get form to delete
exports.deleteGet = async (req, res, next) => {
  try {
    // find the armor to delete
    const armor = await Armor.findById(req.params.id, 'name displayName size');
    if (armor === null) {
      const err = new Error('Armor not found');
      err.status = 404;
      return next(err);
    }

    // check for occurrence in shops
    const shopsWithItem = await findShopsWithItem(armor._id);
    if (shopsWithItem.length > 0) {
      res.render(
        'deleteError',
        {
          displayName: armor.displayName,
          shops: shopsWithItem,
        }
      )
    } else {
      // delete form
      res.render(
        'deleteForm',
        {
          title: 'Confirm delete',
          item: armor
        }
      );
    }
  } catch (err) {
    return next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    // check for occurrence in shops
    const shopsWithItem = await findShopsWithItem(req.body.id);

    if (shopsWithItem.length > 0) {
      throw new Error (`Cannot delete an item that's listed in a shop's inventory`);
    }

    
    // find and delete
    const armor = await Armor.findByIdAndRemove(req.body.id);
    
    if (armor === null) {
      const err = new Error('Armor not found');
      err.status = 404;
      return next(err);
    }

    // redirect to armor
    res.redirect('/armor');
  } catch (err) {
    return next(err);
  }
};

exports.createGet = async (req, res, next) => {
  // blank armor
  const blankArmor = createArmorObj();
  // render form
  res.render(
    'armorForm',
    {
      title: `Create armor`,
      item: blankArmor,
      armorTypes: armorDefinitions.armorTypes,
      sizes: armorDefinitions.sizes,
    }
  );
};

exports.createPost = [
  validationRules(),
  processArmorFormData,
];