const jwt = require('jsonwebtoken');
const config = require('./config');
const UserModel = require('../models/UserModel');

const authenticate = (req, res, next) => {
  const token = req.body.authToken || req.query.authToken;
  if (!token) {
    res.status(401).send('Unauthorized: No token provided');
  } else {
    jwt.verify(token, config.jwtSecret, async (err, decoded) => {
      if (decoded) {
        const uuidIsValid = await UserModel.uuidExists(decoded.uuid);
        uuidIsValid ? next() : res.status(401).send('Unauthorized: Invalid token');
      } else {
        res.status(401).send('Unauthorized: Invalid token');
      }
    });
  }
}

module.exports = authenticate;
