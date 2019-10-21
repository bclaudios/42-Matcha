const driver = require('../db/database.js');
const session = driver.session();

async function setAllAsRead(uuid) { 
  try {
    const res = await session.run(`
      MATCH (n:Notification), (u:User {uuid: $uuid})
      WHERE n.to = u.userId AND n.status = 'unseen'
      SET n.status = 'seen'
      RETURN n
    `, { 
      uuid: uuid,
    });
    session.close();
  } catch(err) { console.log(err) }
}

async function getNotifications(uuid) { 
  try {
    const res = await session.run(`
      MATCH (n:Notification), (u:User {uuid: $uuid})
      WHERE n.to = u.userId
      WITH n, n.from AS userId, n.type AS type, duration.inDays(n.dateTime, DateTime({timezone: 'Europe/Paris'})).days as days, n.status AS status
      MATCH (u:User {userId: userId})
      RETURN u.username AS username, type, days, status
      ORDER BY n.dateTime DESC
    `, { uuid: uuid });
    session.close();
    const notifications = res.records.map(record => {
      const username = record.get('username');
      const type = record.get('type');
      const days = record.get('days').low;
      let duration = '';
      if (days === 0) duration = 'today';
      if (days === 1) duration = 'yesterday';
      if (days > 1) duration = `${days} days ago`;
      const status = record.get('status');
      return { username, type, duration, status }
    });
    setAllAsRead(uuid);
    return notifications;
  } catch(err) { console.log(err) }
}

async function createNotification(uuid, type, targetUserId) { 
  try {
    await session.run(`
      MATCH (u:User {uuid: $uuid})
      CREATE (n:Notification {
        type: $type,
        from: u.userId,
        to: $targetUserId,
        status: 'unseen',
        dateTime: DateTime({timezone: 'Europe/Paris'}) 
      })
      `, {
      type,
      targetUserId,
      uuid,
    });
    session.close();
    return;
  } catch(err) { console.log(err) }
}

async function unseenNotificationsNb(uuid) { 
  try {
    const res = await session.run(`
      MATCH (n:Notification), (u:User {uuid: $uuid})
      WHERE n.to = u.userId AND n.status = 'unseen'
      RETURN COUNT(n) AS nb
    `, { 
      uuid: uuid,
    });
    session.close();
    const nb = res.records[0].get('nb').low;
    return nb;
  } catch(err) { console.log(err) }
}

module.exports = {
  getNotifications,
  createNotification,
  unseenNotificationsNb,
}
