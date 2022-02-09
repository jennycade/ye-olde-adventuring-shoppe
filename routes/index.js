var express = require('express');
var router = express.Router();

// import controllers
const weaponController = require('../controllers/weaponController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome to Ye Olde Adventuring Shoppe' });

});

// get weapons
router.get('/weapons/', weaponController.weaponList);

router.get('/weapons/:id', weaponController.weaponDetail);

module.exports = router;
