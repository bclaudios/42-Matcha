const ChatModel = require('../models/ChatModel');
const jwt = require('jsonwebtoken');
const config = require('../middlewares/config');

const getDiscussions = (req, res) => {
      const token = req.body.authToken || req.query.authToken;
      jwt.verify(token, config.jwtSecret, async (err, decoded) => {
            try {
                  const discussions = await ChatModel.getDiscussions(decoded.uuid);
                  res.status(200).json({ discussions });
            } catch(e) {
                  res.status(400).send('Error');
            }
      });
};

const getCurrentDiscussionMessages = async (req, res) => {
      const token = req.body.authToken || req.query.authToken;
      jwt.verify(token, config.jwtSecret, async (err, decoded) => {
            try {
                  const { matchId } = req.body;
                  let currentDiscussionMessages = await ChatModel.getCurrentDiscussionMessages(decoded.uuid, matchId);
                  currentDiscussionMessages = currentDiscussionMessages === null ? 'no msg yet' : currentDiscussionMessages;
                  res.status(200).json({ currentDiscussionMessages });
            } catch(e) {
                  res.status(400).send('Error');
            }
      });
};

const createMessage = async (req, res) => {
      const token = req.body.authToken || req.query.authToken;
      jwt.verify(token, config.jwtSecret, async (err, decoded) => {
            try {
                  const { matchId, youUserId, message } = req.body;
                  await ChatModel.createMessage(decoded.uuid, matchId, youUserId, message);
                  res.status(200).send('OK');
            } catch(e) {
                  res.status(400).send('Error');
            }
      });
};

const getUnreadMessagesNb = async (req, res) => {
      const token = req.body.authToken || req.query.authToken;
      jwt.verify(token, config.jwtSecret, async (err, decoded) => {
            try {
                  const nb = await ChatModel.getUnreadMessagesNb(decoded.uuid);
                  res.status(200).json({ nb });
            } catch(e) {
                  res.status(400).send('Error');
            }
      });
};

module.exports = {
      getDiscussions,
      getCurrentDiscussionMessages,
      createMessage,
      getUnreadMessagesNb,
};

