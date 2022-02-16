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
    const items = shops.map((s) => {
      return {
        name: s.name || `Shop ${s._id}`,
        url: s.url,
      }
    })
    res.render(
      'list',
      {
        title: 'All shops',
        items,
      }
    );
  } catch (err) {
    return next(err);
  }
};

exports.shopDetail = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate('weaponsInStock armorInStock')
      .exec();
    if (shop === null) {
      const err = new Error(`Shop not found`);
      err.status = 404;
      return next(err);
    }

    const weaponsInStock = convertPopulatedInventoryArrayToObj(shop.weaponsInStock);
    const armorInStock = convertPopulatedInventoryArrayToObj(shop.armorInStock);

    res.render(
      'shopDetail',
      {
        title: shop.name || `Shop ${shop._id}`,
        item: shop,
        weaponsInStock,
        armorInStock,
      }
    );
  } catch (err) {
    return next(err);
  }
};

const getAllInventoryItems = async () => {
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
    const n = arr.filter(x => x.toString() === item._id.toString()).length;
    inventoryObj[item._id] = n;
  });

  return inventoryObj;
};

const convertPopulatedInventoryArrayToObj = (arr) => {
  // takes in something like
  // arr = [
  //   {
  //     _id: 'id1',
  //     name: 'weaponName1',
  //     url: 'url1',
  //     ...
  //   },
  //   {
  //     _id: 'id3',
  //     name: 'weaponName3',
  //     url: 'url3',
  //     ...
  //   },
  //   {
  //     _id: 'id1',
  //     name: 'weaponName1',
  //     url: 'url1',
  //     ...
  //   }
  // ]
  //
  // and returns
  // obj = {
  //   id1: {
  //     _id: 'id1',
  //     name: 'weaponName1',
  //     url: 'url1',
  //     qty: 2,
  //     ...
  //   },
  //   id3: {
  //     _id: 'id3',
  //     name: 'weaponName3',
  //     url: 'url3',
  //     qty: 1,
  //     ...
  //   }
  // }

  // copy
  const inventoryObj = {};
  const allIds = arr.map(item => item._id);
  // get unique ids
  const ids = [... new Set(allIds) ];
  ids.forEach(id => {
    // copy item data over
    inventoryObj[id] = {...arr.find(x => x._id === id).toObject({virtuals: true})};
    inventoryObj[id].qty = allIds.filter(x => x === id).length;
  });
  return inventoryObj;
}

const convertFormDataToInventoryArrays = (reqBody) => {
  // extract all fields with prefix 'weapon' or 'armor'
  const weaponsArr = [];
  const armorArr = [];
  Object.keys(reqBody).forEach(fieldID => {
    if (fieldID.search('weapon') === 0 && parseInt(reqBody[fieldID]) > 0) {
      // parse id
      const id = fieldID.substring(7);
      // add qty times to weaponsArr
      for (let i=0; i<parseInt(reqBody[fieldID]); i++) {
        weaponsArr.push(id);
      }
    } else if (fieldID.search('armor') === 0 && parseInt(reqBody[fieldID]) > 0) {
      // parse id
      const id = fieldID.substring(6);
      // add qty times to weaponsArr
      for (let i=0; i<parseInt(reqBody[fieldID]); i++) {
        armorArr.push(id);
      }
    }
  });

  return { weaponsArr, armorArr };
};

const convertInventoryFieldsToArray = (req, res, next) => {
  const invFields = ['armor', 'weapon'];

  invFields.forEach((prefix) => {
    const obj = {};
    Object.keys(req.body).forEach((fieldID) => {
      if (fieldID.search(prefix) === 0) {
        // want
        // body.weapons = {id1: inputval1, ...}
        obj[fieldID] = req.body[fieldID];
      }
    });
    req.body[prefix] = obj;
  });
  next();
};

exports.createGet = async (req, res, next) => {
  // get the form data
  try {
    const { allArmor, allWeapons } = await getAllInventoryItems();

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

const validationRules = () => {
  return [
    body('name')
      .optional({checkFalsy: true}).trim().escape()
      .isLength({ max: 100 }).withMessage('Name must be less than 100 characters'),
    body('description')
      .optional({checkFalsy: true}).trim().escape(),
    body('weapon.*')
      .optional({checkFalsy: true}).trim().escape()
      .isInt({min:0}).withMessage('All quantities must be whole numbers'),
    body('armor.*')
      .optional({checkFalsy: true}).trim().escape()
      .isInt({min: 0}).withMessage('All quantities must be whole numbers'),
  ]
}

const processFormData = async (req, res, next) => {
  // track form type: create or update?
  let formType = 'Create';
  // convert inventory form data to arrays of object ids
  const {weaponsArr, armorArr} = convertFormDataToInventoryArrays(req.body);
  const { allArmor, allWeapons } = await getAllInventoryItems();

  // make the shop
  const shop = new Shop({
    name: req.body.name,
    description: req.body.description,
    weaponsInStock: weaponsArr,
    armorInStock: armorArr,
  });

  // update?
  if (req.params.id) {
    formType = 'Update';
    shop._id = req.params.id;
  }

  // form data errors?
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // re-render the form
    const weaponsStock = convertInventoryArrayToObj(weaponsArr, allWeapons);
    const armorStock = convertInventoryArrayToObj(armorArr, allArmor);

    res.render(
      'shopForm',
      {
        title: `${formType} shop`,
        item: shop,
        allWeapons,
        allArmor,
        weaponsStock,
        armorStock,
        errors: errors.array(),
      }
    );
  } else {
    // no errors, save it
    try {
      if (formType === 'Create') {
        await shop.save();
        res.redirect(shop.url);
      } else if (formType === 'Update') {
        await Shop.findByIdAndUpdate(
          req.params.id,
          shop,
        );
        res.redirect(shop.url);
      }
    } catch (err) {
      return next(err);
    }
  }
}

exports.formPost = [
  // handle dynamic inventory fields
  convertInventoryFieldsToArray,
  // validate
  validationRules(),
  // process
  processFormData,
];

// get form to update
exports.updateGet = async(req, res, next) => {
  // get the shop
  const shop = await Shop.findById(req.params.id);
  if (shop === null) {
    const err = new Error('Shop not found');
    err.status = 404;
    return next(err);
  }

  // build the inventory
  const { allArmor, allWeapons } = await getAllInventoryItems();
  const weaponsStock = convertInventoryArrayToObj(
    shop.weaponsInStock.toString().split(','),
    allWeapons
  );
  const armorStock = convertInventoryArrayToObj(
    shop.armorInStock.toString().split(','),
    allArmor
  );

  // render
  res.render(
    'shopForm',
    {
      title: 'Update shop',
      item: shop,
      allWeapons,
      allArmor,
      weaponsStock,
      armorStock,
    }
  )
};

// get form to delete
exports.deleteGet = async (req, res, next) => {
  try {
    // find the shop to delete
    const shop = await Shop.findById(req.params.id, 'name displayName');
    if (shop === null) {
      const err = new Error('Shop not found');
      err.status = 404;
      return next(err);
    }

    // delete form
    res.render(
      'deleteForm',
      {
        title: 'Confirm delete',
        item: shop
      }
    );
  } catch (err) {
    return next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    // find and delete
    const shop = await Shop.findByIdAndRemove(req.body.id);
    
    if (shop === null) {
      const err = new Error('Shop not found');
      err.status = 404;
      return next(err);
    }

    // redirect to armor
    res.redirect('/shops');
  } catch (err) {
    return next(err);
  }
};