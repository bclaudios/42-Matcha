const express = require('express');
const router = express.Router();
const { allTags, createTag } = require('../../controllers/tagController');
const authenticate = require('../../middlewares/authenticate');

router.route('/')
      .get(authenticate, (req,res) => { allTags(req, res) })

router.route('/create')
      .post(authenticate, (req, res) => { createTag(req, res) })

module.exports = router;