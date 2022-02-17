const dotenv = require('dotenv').config();
const PW = process.env.ADMINPASSWORD;
const { body } = require('express-validator');

exports.verifyAdminPasswordRule = () => {
  return [
    body('password', 'Incorrect admin password')
      .escape().trim().equals(PW),
  ];
}