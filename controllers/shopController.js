const Shop = require('../models/shop');

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