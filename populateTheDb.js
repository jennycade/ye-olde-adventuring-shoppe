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
  // armor
  const createArmor = async (armorRow) => {
    try {
      // process
      const armorObj = {...armorRow};
      // strip whitespace from armorType
      armorObj.armorType = armorRow.armorType.trim();
      // parse booleans
      armorObj.stealthDisadvantage = armorRow.stealthDisadvantage === 'TRUE';

      // save
      const armor = new Armor(armorObj.name);
      await armor.save();
      console.log(`New armor: ${armor}`);
    } catch (err) {
      console.log(`Error importing armor: ${err}`);
    }
  };
  // weapon properties
  const createWeaponProperty = async (row) => {
    try {
      // process
      const obj = {...row};

      // save
      const weaponProperty = new WeaponProperty(obj);
      await weaponProperty.save();
      console.log(`New weapon property: ${weaponProperty.name}`);
    } catch (err) {
      console.log(`Error importing weapon property: ${err}`);
    }
  };
  // weapons
  const createWeapon = async (row) => {
    try {
      // process
      const obj = {...row};
      // convert weapon property string to array of matching WeaponProperty ids
      if (row.properties !== '') {
        const props = row.properties.split(', ');
        const properties = [];
        await props.forEach( async (prop) => {
          // find the WeaponProperty with matching name
          const weaponProperty = await WeaponProperty.findOne({name: prop}).exec();
          if (!weaponProperty) {
            throw new Error(`Can't find weaponProperty with name ${prop}`);
          }
          properties.push(weaponProperty);
        });
        obj.properties = properties;
      } else {
        obj.properties = [];
      }
      // strip whitespace from damageDice
      obj.damageDice = obj.damageDice.trim();

      // save
      const weapon = new Weapon(obj);
      await weapon.save();
      console.log(`New weapon: ${weapon.name}`);
    } catch (err) {
      console.log(`Error importing weapon: ${err}`);
    }
  }
  const checkWeapon = async (row, importedWeaponNames) => {
    // print weapon only if weapon isn't already in the database
    if (!importedWeaponNames.includes(row.name)) {
      console.log(`Re-importing weapon: ${row.name}`);
      await createWeapon(row);
    }
  };
  
  // read CSV files
  // armor
  const importAllArmor = async () => {
    fs.createReadStream('./data/armor.csv')
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', async row => { await createArmor(row)})
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
  }
  // weapon properties
  const importAllWeaponProperties = async () => {
    fs.createReadStream('./data/weaponProperties.csv')
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', async row => { await createWeaponProperty(row)})
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
  }
  // weapons
  const importAllWeapons = async () => {
    fs.createReadStream('./data/weapons.csv')
    .pipe(csv.parse({ headers: true}))
    .on('error', error => console.error(error))
    .on('data', async (row) => { await createWeapon(row)})
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
  }
  const checkAllWeapons = async (importedWeaponNames) => {
    fs.createReadStream('./data/weapons.csv')
    .pipe(csv.parse({ headers: true}))
    .on('error', error => console.error(error))
    .on('data', async (row) => { await checkWeapon(row, importedWeaponNames)})
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
  }

  // execute
  // armor
  const numArmorDocs = await Armor.countDocuments({});
  if (numArmorDocs === 0) {
    await importAllArmor();
  } else {
    console.log(`Skipping importAllArmor() - ${numArmorDocs} documents`);
  }
  // weapon properties
  const numWeaponPropertyDocs = await WeaponProperty.countDocuments({});
  if (numWeaponPropertyDocs === 0) {
    await importAllWeaponProperties();
  } else {
    console.log(`Skipping importAllWeaponProperties() - ${numWeaponPropertyDocs} documents`);
  }
  // weapons
  const numWeaponDocs = await Weapon.countDocuments({});
  if (numWeaponDocs === 0) {
    await importAllWeapons();
  } else {
    console.log(`Skipping importAllWeapons() - ${numWeaponDocs} documents`);
  }

  // retrying weapons
  const importedWeapons = await Weapon.find({}, 'name');
  const importedWeaponNames = importedWeapons.map(obj => obj.name);
  await checkAllWeapons(importedWeaponNames);

  // process.exit();
}
