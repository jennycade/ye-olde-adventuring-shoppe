const Shop = require('../models/shop');
const Armor = require('../models/armor');
const Weapon = require('../models/weapon');

const { body, validationResult } = require('express-validator');

// list all shops - TODO: for DMs only!
exports.shopList = async (req, res, next) => {
  try {
    const shops = await Shop.find()
      .sort({name: 1})
      .exec();
    res.render(
      'list',
      {
        title: 'All shops',
        items: shops,
      }
    );
  } catch (err) {
    return next(err);
  }
};

exports.shopDetail = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id).exec();
    if (shop === null) {
      const err = new Error(`Shop not found`);
      err.status = 404;
      return next(err);
    }
    res.render(
      'shopDetail',
      {
        title: shop.name || `Shop ${shop._id}`,
        shop
      }
    );
  } catch (err) {
    return next(err);
  }
};

const getFormData = async () => {
  const allWeapons = await Weapon.find({}, 'name url')
    .sort({name: 1})
    .exec();
  const preAllArmor = await Armor.find({}, 'name size displayName url')
    .sort({name: 1})
    .exec();
  const allArmor = preAllArmor.map(armor => {
    return {
      _id: armor._id,
      name: armor.displayName,
      url: armor.url
    };
  })
  return { allArmor, allWeapons };
}

const convertInventoryArrayToObj = (arr, allInventoryItems) => {
  // takes in [objId1, objId3, objId1] and inventory list with names and ids (e.g.)
  // returns
  // {
  //   objId1: 2,
  //   objId2: 0,
  //   objId3: 1
  // }
  const inventoryObj = {};
  allInventoryItems.forEach((item) => {
    // count occurrences
    const n = arr.filter(x => x === item._id).length;
    inventoryObj[item._id] = n;
  });

  return inventoryObj;
};

const convertFormDataToInventoryArrays = (reqBody) => {
  // extract all fields with prefix 'weapon' or 'armor'
  const weaponsArr = [];
  const armorArr = [];
  Object.keys(reqBody).forEach(fieldID => {
    if (fieldID.search('weapon') === 0 && parseInt(reqBody[fieldID]) > 0) {
      // parse id
      const id = fieldID.substring(6);
      // add qty times to weaponsArr
      for (let i=0; i<parseInt(reqBody[fieldID]); i++) {
        weaponsArr.push(id);
      }
    } else if (fieldID.search('armor') === 0 && parseInt(reqBody[fieldID]) > 0) {
      // parse id
      const id = fieldID.substring(5);
      // add qty times to weaponsArr
      for (let i=0; i<parseInt(reqBody[fieldID]); i++) {
        armorArr.push(id);
      }
    }
  });

  return { weaponsArr, armorArr };
};

exports.createGet = async (req, res, next) => {
  // get the form data
  try {
    const { allArmor, allWeapons } = await getFormData();

    const blankShop = new Shop({
      name: '',
      description: '',
      weaponsInStock: [],
      armorInStock: [],
    });

    const weaponsStock = convertInventoryArrayToObj([], allWeapons);
    const armorStock = convertInventoryArrayToObj([], allArmor);

    res.render(
      'shopForm',
      {
        title: 'Create shop',
        item: blankShop,
        allWeapons,
        allArmor,
        weaponsStock,
        armorStock,
      }
    );

  } catch (err) {
    return next(err);
  }
};

const getValidationRules = async () => {
  const { allArmor, allWeapons} = await getFormData();

  const rulesArr = [
    body('name')
      .optional({checkFalsy: true}).trim().escape()
      .isLength({ max: 100 }).withMessage('Name must be less than 100 characters'),
    body('description')
      .optional({checkFalsy: true}).trim().escape(),
  ];

  allWeapons.forEach(weapon => {
    rulesArr.push(
      body(`weapon${weapon._id}`)
        .optional({checkFalsy: true}).trim().escape()
        .isInt().withMessage('All quantities must be whole numbers')
    );
  });
  allArmor.forEach(armor => {
    rulesArr.push(
      body(`armor${armor._id}`)
        .optional({checkFalsy: true}).trim().escape()
        .isInt().withMessage('All quantities must be whole numbers')
    );
  });

  return rulesArr;
};

const validationRules = () => {
  return [
    body('name')
      .optional({checkFalsy: true}).trim().escape()
      .isLength({ max: 100 }).withMessage('Name must be less than 100 characters'),
    body('description')
      .optional({checkFalsy: true}).trim().escape(),
    body('weapon*')
      .optional({checkFalsy: true}).trim().escape()
      .isInt().withMessage('All quantities must be whole numbers'),
    body('armor*')
      .optional({checkFalsy: true}).trim().escape()
      .isInt().withMessage('All quantities must be whole numbers'),
  ]
}

const processFormData = async (req, res, next) => {
  // convert inventory form data to arrays of object ids
  const {weaponsArr, armorArr} = convertFormDataToInventoryArrays(req.body);
  
  // make the shop
  const shop = new Shop({
    name: body.name,
    description: body.description,
    weaponsInStock: weaponsArr,
    armorInStock: armorArr,
  });

  // form data errors?
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // re-render the form
    const weaponsStock = convertInventoryArrayToObj(weaponsArr, allWeapons);
    const armorStock = convertInventoryArrayToObj(armorArr, allArmor);

    res.render(
      'shopForm',
      {
        title: 'Create shop',
        item: blankShop,
        allWeapons,
        allArmor,
        weaponsStock,
        armorStock,
        errors: errors.array(),
      }
    );
  }
}

exports.formPost = [
  // validate
  validationRules(),
  // process
  processFormData,
];

// get form to update
exports.updateGet = async(req, res, next) => {
  res.render(
    'layout',
    { title: 'Update'}
  );
};

// get form to delete
exports.deleteGet = async(req, res, next) => {
  res.render(
    'layout',
    { title: 'Delete'}
  );
};