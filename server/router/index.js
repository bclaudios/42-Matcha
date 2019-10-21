const express = require('express');
const router = express.Router();
 
router.use('/users', require('./routes/userRoutes'));
router.use('/tags', require('./routes/tagRoutes'));
router.use('/auth', require('./routes/authRoutes'));
router.use(`/search`, require(`./routes/searchRoutes`));
router.use('/notifications', require('./routes/notificationsRoutes'));
router.use('/chat', require('./routes/chatRoutes'));

module.exports = router;