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
  const allArmor = await Armor.find({}, 'name url')
    .sort({name: 1})
    .exec();
  const allWeapons = await Weapon.find({}, 'name url')
    .sort({name: 1})
    .exec();
  return { allArmor, allWeapons };
}

exports.createGet = async (req, res, next) => {
  // get the form data
  try {
    const { allArmor, allWeapons } = await getFormData();

    

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