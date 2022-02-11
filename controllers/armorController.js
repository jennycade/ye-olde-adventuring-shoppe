const Armor = require('../models/armor');

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