const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('fast-csv');
const dotenv = require('dotenv').config();
const mongoDB = process.env.MONGO_URI;


main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(mongoDB);

  // import models
  const Weapon = require('./models/weapon');
  const WeaponProperty = require('./models/weaponProperty');
  const Armor = require('./models/armor');
  const Shop = require('./models/shop');

  // saving
  const createArmor = async (armorRow) => {
    const armor = new Armor(armorRow);
    await armor.save();
    console.log(`New armor ${armor}`);
  };

  // read armor
  const importAllArmor = async () => {
    fs.createReadStream('./data/armor.csv')
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', row => {createArmor(row)})
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
  }

  await importAllArmor();
}
