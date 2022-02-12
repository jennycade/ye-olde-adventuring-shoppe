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
router.get('/weapons/create', weaponController.createGet);
router.post('/weapons/create', weaponController.updatePost);
router.get('/weapons/:id', weaponController.weaponDetail);
router.get('/weapons/:id/update', weaponController.updateGet);
router.post('/weapons/:id/update', weaponController.updatePost);
router.get('/weapons/:id/delete', weaponController.deleteGet);
router.post('/weapons/:id/delete', weaponController.deletePost);

// armor
router.get('/armor/', armorController.armorList);
router.get('/armor/create', armorController.createGet);
router.post('/armor/create', armorController.updatePost);
router.get('/armor/:id', armorController.armorDetail);
router.get('/armor/:id/update', armorController.updateGet);
router.post('/armor/:id/update', armorController.updatePost);
router.get('/armor/:id/delete', armorController.deleteGet);

// shops
router.get('/shops/', shopController.shopList);
router.get('/shops/:id', shopController.shopDetail);
router.get('/shops/:id/update', shopController.updateGet);
router.get('/shops/:id/delete', shopController.deleteGet);

module.exports = router;
