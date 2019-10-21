const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const router = require('./router');
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const UserModel = require('./models/UserModel');
const ChatModel = require('./models/ChatModel');
const jwt = require('jsonwebtoken');
const config = require('./middlewares/config');

app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))
app.use(cookieParser());
app.use('/api', router);

var path = require("path");

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, '/../client/public/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})

io.use(async (client, next) => {
  const token = client.handshake.query.token;
  jwt.verify(token, config.jwtSecret, async (err, decoded) => {
    client.uuid = decoded.uuid;
    const userId = await UserModel.userIdFromUuid(decoded.uuid);
    client.userId = userId;
    return next();
  });
});

io.on('connection', async client => { 
  client.join(`${client.userId}-room`);

  const matchIds = await ChatModel.getMatchIdsByUserId(client.userId);
  if (matchIds !== null) {
    matchIds.map(matchId => {
      client.join(`${matchId}-room`);
    });
  }

  const userIds = Object.keys(io.sockets.sockets).map(elem => io.sockets.sockets[elem].userId);
  io.emit('isConnected', userIds);

	client.on('disconnect', () => {
    UserModel.setlastConnection(client.userId);
    const userIds = Object.keys(io.sockets.sockets).map(elem => io.sockets.sockets[elem].userId);
    io.emit('isConnected', userIds);
  });

  client.on('logout', () => {
    const filteredUserIds = Object.keys(io.sockets.sockets).map(elem => io.sockets.sockets[elem].userId).filter(userId => {
      return !(io.sockets.sockets[client.id].userId === userId);
    });
    client.broadcast.emit('isConnected', filteredUserIds);
    client.disconnect();
  });

  client.on('createNotification', async data => {
    client.to(`${data.targetUserId}-room`).emit('receiveNotification');
    if (data.type === 'unliked') {
      io.to(`${data.targetUserId}-room`).emit('unliked');
      io.to(`${client.userId}-room`).emit('unliked');
    }
    if (data.type === 'matched') {
      const matchId = await ChatModel.getMatchIdByTwoUserIds(client.userId, data.targetUserId);
      io.to(`${data.targetUserId}-room`).emit('makeItJoinMatchId', matchId);
      io.to(`${client.userId}-room`).emit('makeItJoinMatchId', matchId); 
      io.to(`${data.targetUserId}-room`).emit('reloadDiscussions');
      io.to(`${client.userId}-room`).emit('reloadDiscussions');
    }
  });

  client.on('setCurrentDiscussionMatchId', async matchId => {
    client.currentDiscussionMatchId = matchId;
  });

  client.on('joinMatchId', async matchId => {
    client.join(`${matchId}-room`);
  });

  client.on('newMessageSent', async data => {
    const socketId = Object.keys(io.sockets.sockets).filter(elem => io.sockets.sockets[elem].userId === data.youUserId);
    if (io.sockets.sockets[socketId] !== undefined) {
      const currentDiscussionMatchIdOfReceiver = io.sockets.sockets[socketId].currentDiscussionMatchId;
      if (currentDiscussionMatchIdOfReceiver !== undefined && currentDiscussionMatchIdOfReceiver !== null) {
        await ChatModel.setAllAsReadByMatchIdAndUserId(currentDiscussionMatchIdOfReceiver, data.youUserId)
      }
    }
    const youUuid = await UserModel.getUuidByUserId(data.youUserId);
    const nb = await ChatModel.getUnreadMessagesNb(youUuid);
    client.to(`${data.matchId}-room`).emit('setUnreadMessagesNb', nb);
    client.to(`${data.matchId}-room`).emit('reloadDiscussions');
    io.in(`${data.matchId}-room`).emit('newMessageReceived', data.matchId);
  });
});

const port = 5000;
server.listen(port, () => `Server running on port ${port}`);
