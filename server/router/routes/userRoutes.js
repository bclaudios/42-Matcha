const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/authenticate');
const UserController = require('../../controllers/userController');

router.route('/')
      .get(authenticate, (req, res) => { UserController.getCurrentProfile(req, res) })

router.route('/create')
      .post((req, res) => { UserController.createUser(req, res); })

router.route('/confirmation')
      .post((req, res) => { UserController.confirmUser(req, res); });

router.route('/createRelationship')
      .post(authenticate, (req, res) => { UserController.createRelationship(req, res); });

router.route('/deleteRelationship')
      .delete(authenticate, (req, res) => { UserController.deleteRelationship(req, res); });

router.route('/hasFullProfile')
      .get(authenticate, (req, res) => { UserController.hasFullProfile(req, res); });

router.route('/resetPassword')
      .post((req, res) => { UserController.resetPassword(req, res); });

router.route('/resetPasswordEmail')
      .post((req, res) => { UserController.resetPasswordEmail(req, res); });

router.route('/:username')
      .get(authenticate, (req, res) => { UserController.getProfile(req, res) })

router.route(`/updateProfile`)
      .post(authenticate, (req, res) => { UserController.updateProfile(req, res) })

router.route(`/addTag`)
      .post(authenticate, (req, res) => { UserController.addTag(req, res); })

router.route(`/removeTag`)
      .delete(authenticate, (req, res) => { UserController.removeTag(req, res); })

router.route(`/uploadPic`)
      .post(authenticate, (req, res) => { UserController.uploadPic(req, res); });

router.route(`/reportUser`)
      .post(authenticate, (req, res) => { UserController.reportUser(req, res); })

router.route(`/blockUser`)
      .post(authenticate, (req, res) => { UserController.blockUser(req, res); });

module.exports = router;



