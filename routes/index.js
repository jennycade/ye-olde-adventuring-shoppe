var express = require('express');
var router = express.Router();

// import controllers
const weaponController = require('../controllers/weaponController');
const armorController = require('../controllers/armorController');
const shopController = require('../controllers/shopController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome to Ye Olde Adventuring Shoppe' });

});

// weapons
router.get('/weapons/', weaponController.weaponList);
router.get('/weapons/:id', weaponController.weaponDetail);

// armor
router.get('/armor/', armorController.armorList);
router.get('/armor/:id', armorController.armorDetail);

// shops
router.get('/shops/', shopController.shopList);
router.get('/shops/:id', shopController.shopDetail);

module.exports = router;
