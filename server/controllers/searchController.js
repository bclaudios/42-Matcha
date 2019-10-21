const SearchModel = require('../models/SearchModel');
const jwt = require('jsonwebtoken');
const config = require('../middlewares/config');
const Log = require(`../tools/Log`);

const getUuidFromToken = async (req, res) => {
      try {
            const token = req.body.authToken || req.query.authToken;
            const uuid = await jwt.verify(token, config.jwtSecret, (err, decoded) => {
                  if (err) res.status(401).send('Unauthorized: Invalid token');
                  return decoded.uuid;
            });
            return uuid;
      } catch (error) { Log.error(error, `getUuidFromToken`, __filename) }
}

const searchUsers = async (req, res) => {
      try {
            const uuid = await getUuidFromToken(req, res);
            const users = await SearchModel.searchUsers(uuid, req.body)
            res.json({usersArr: users});
      } catch (error) { Log.error(error, `searchUsers`, __filename) }
}


const filtersMinMax = async (req, res) => {
      try {
            const filtersMinMax = await SearchModel.filtersMinMax();
            res.json({ age: filtersMinMax.age, score: filtersMinMax.score });
      } catch (error) { Log.error(error, `filtersMinMax`, __filename) }
};

const suggestedUsers = async (req, res) => {
      try {
            const uuid = await getUuidFromToken(req, res);
            const users = await SearchModel.suggestedUsers(uuid, req.body);
            res.json({usersArr: users});
      } catch (error) { Log.error(error, `suggestedUsers`, __filename) }
}

const ownCityLatLng = async (req, res) => {
      try {
            const uuid = await getUuidFromToken(req, res);
            const cityLatLng = await SearchModel.ownCityLatLng(uuid);
            res.json({ cityLatLng });
      } catch (error) { Log.error(error, `ownCityLatLng`, __filename) }
}

module.exports = {
      searchUsers,
      suggestedUsers,
      filtersMinMax,
      ownCityLatLng,
}