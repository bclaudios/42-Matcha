const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/authenticate');
const ChatController = require('../../controllers/chatController');

router.route('/')
      .post(authenticate, (req, res) => { ChatController.createMessage(req, res); })

router.route('/discussions')
      .get(authenticate, (req, res) => { ChatController.getDiscussions(req, res); })

router.route('/unreadMessagesNb')
      .get(authenticate, (req, res) => { ChatController.getUnreadMessagesNb(req, res); })

router.route('/currentDiscussionMessages')
      .post(authenticate, (req, res) => { ChatController.getCurrentDiscussionMessages(req, res); })

module.exports = router;
