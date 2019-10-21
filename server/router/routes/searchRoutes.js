const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/authenticate');
const SearchController = require('../../controllers/searchController');

router.route('/')
      .post(authenticate, (req, res) => { SearchController.searchUsers(req, res); });

router.route('/matcher')
      .post(authenticate, (req, res) => { SearchController.suggestedUsers(req, res); });

router.route('/filtersMinMax')
      .get(authenticate, (req, res) => { SearchController.filtersMinMax(req, res); });

router.route('/ownCityLatLng')
      .get(authenticate, (req, res) => { SearchController.ownCityLatLng(req, res); });

module.exports = router;
