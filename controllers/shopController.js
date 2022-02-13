const Shop = require('../models/shop');
const Armor = require('../models/armor');
const Weapon = require('../models/weapon');

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
    return { name: armor.displayName, url: armor.url };
  })
  return { allArmor, allWeapons };
}

const convertInventoryArrayToObj = (arr, allInventoryItems) => {
  // takes in [objId1, objId3, objId1] and inventory list with names and ids (e.g.)
  // returns { objId1: {name: 'object 1', qty: 2}, objId2: {name: 'object 2', qty: 0}, objId3: {name: 'object 3', qty: 1}}
  const inventoryObj = {};
  allInventoryItems.forEach((item) => {
    // count occurrences
    const n = arr.filter(x => x === item._id).length;
    inventoryObj.item = {
      name: item.name,
      id: item._id,
      qty: n,
    }
  });

  return inventoryObj;
};

exports.createGet = async (req, res, next) => {
  // get the form data
  try {
    const { allArmor, allWeapons } = await getFormData();

    const blankShop = new Shop({
      name: '',
      description: '',
      weaponsInStock: convertInventoryArrayToObj([], allWeapons),
      armorInStock: convertInventoryArrayToObj([], allArmor),
    });

    res.render(
      'shopForm',
      {
        title: 'Create shop',
        item: blankShop,
        allWeapons,
        allArmor,
      }
    )

  } catch (err) {
    return next(err);
  }
};

exports.formPost = [];

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