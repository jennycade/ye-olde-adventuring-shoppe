// #! /usr/bin/env node

// // Get arguments passed on command line
// var userArgs = process.argv.slice(2);
// /*
// if (!userArgs[0].startsWith('mongodb')) {
//   console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
//   return
// }
// */
// var async = require('async');

// // import models
// const Weapon = require('./models/weapon');
// const WeaponProperty = require('./models/weaponProperty');
// const Armor = require('./models/armor');
// const Shop = require('./models/shop');

// // connect
// const mongoose = require('mongoose');
// const mongoDB = userArgs[0];
// mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.Promise = global.Promise;
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error'));

// const weaponProperties = [];
// const weaponInventory = [];
// const armorInventory = [];
// const shops = [];

// const createWeaponProperty = (weaponPropertyRow, cb) => {
//   const weaponProperty = new WeaponProperty(weaponPropertyRow);

//   weaponProperty.save((err) => {
//     if (err) {
//       cb(err, null);
//       return;
//     }
//     console.log(`New weapon property ${weaponProperty}`);
//     weaponProperties.push(weaponProperty);
//     cb(null, weaponProperty);
//   });
// };

// const createWeapon = (weaponRow, cb) => {
//   const weapon = new Weapon(weaponRow);

//   weapon.save((err) => {
//     if (err) {
//       cb(err, null);
//       return;
//     }
//     console.log(`New weapon ${weapon}`);
//     weaponInventory.push(weapon);
//     cb(null, weapon);
//   });
// };

const createArmor = (armorRow, cb) => {

  const armor = new Armor(armorRow);

  armor.save((err) => {
    if (err) {
      cb(err, null);
      return;
    }
    console.log(`New armor ${armor}`);
    armorInventory.push(armor);
    cb(null, armor);
  });
};

// const createShop = (shopRow, cb) => {
//   const shop = new Shop(shopRow);

//   shop.save((err) => {
//     if (err) {
//       cb(err, null);
//       return;
//     }
//     console.log(`New shop ${shop}`);
//     shops.push(shop);
//     cb(null, shop);
//   });
// }


//// from SO
const fs = require('fs');
const csv = require('fast-csv');

// import models
const Weapon = require('./models/weapon');
const WeaponProperty = require('./models/weaponProperty');
const Armor = require('./models/armor');
const Shop = require('./models/shop');

// connect
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const mongoDB = process.env.MONGO_URI;
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error'));

// log
const log = data => console.log(JSON.stringify(data, undefined, 2));

// read armor
const importAllArmor = async () => {
  fs.createReadStream('./data/armor.csv')
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', row => {createArmor(row)})
  .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
}

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/test');
  await importAllArmor();
}



// disconnect
mongoose.connection.close();