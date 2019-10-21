const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/authenticate');
const NotificationsController = require('../../controllers/notificationController');

router.route('/')
      .get(authenticate, (req, res) => { NotificationsController.getNotifications(req, res); })
      .post(authenticate, (req, res) => { NotificationsController.createNotification(req, res); })

router.route('/unseenNotificationsNb')
      .get(authenticate, (req, res) => { NotificationsController.unseenNotificationsNb(req, res); })

module.exports = router;
