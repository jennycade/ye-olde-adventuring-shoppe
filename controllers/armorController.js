const Armor = require('../models/armor');

// list all
exports.armorList = async (req, res, next) => {
  try {
    const armor = await Armor.find()
      .sort({name: 1})
      .exec();
    res.render(
      'list',
      {
        title: 'All armor',
        items: armor,
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