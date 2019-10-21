const bcrypt = require('bcrypt');
const crypto = require('crypto');
const uuidv1 = require('uuid/v1');
const driver = require('../db/database.js');
const sendEmail = require('../actions/email.js');
const session = driver.session();
const Log = require(`../tools/Log`)

const createUser = async (email, firstName, lastName, username, password, city, latLng) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const uuid = uuidv1();
    const userId = uuidv1();
    const hash = crypto.randomBytes(20).toString('hex');
    await session.run(`
      CREATE (u:User {
        uuid: $uuid,
        userId: $userId,
        email: $email,
        username: $username,
        firstName: $firstName,
        lastName: $lastName,
        password: $password,
        confirmed: $confirmed,
        hash: $hash,
        city: $city,
        latLng: $latLng,
        photos: [],
        avatarIndex: 0.0,
        bio: "",
        score: 0.0,
        lastConnection: DateTime({timezone: 'Europe/Paris'})
        })
    `, {
      uuid: uuid,
      userId: userId,
      email: email,
      username: username,
      firstName: firstName,
      lastName: lastName,
      password: hashedPassword,
      confirmed: false,
      hash: hash,
      city: city,
      latLng: latLng,
    });
    session.close();
    sendEmail('confirmUser', email, hash);
  } catch(error) { Log.error(error, "createUser", __filename) }
}

const usernameExists = async username => {
  try {
    const res = await session.run(`
      MATCH (u:User {username: $username})
      RETURN u
    `, { username: username });
    session.close();
    return !!res.records[0];
  } catch(error) { Log.Error(error, "usernameExists", __filename) }
}

const emailExists = async email => { 
  try {
    const res = await session.run(`
      MATCH (u:User {email: $email})
      RETURN u
    `, { email: email });
    session.close();
    return !!res.records[0];
  } catch(error) { Log.error(error, "emailExists", __filename) }
}

const uuidExists = async uuid => { 
    try {
    const res = await session.run(`
      MATCH (u:User {uuid: $uuid})
      RETURN u
    `, { uuid: uuid });
    session.close();
    return !!res.records[0];
  } catch(error) { Log.error(error, "uuidExists", __filename) }
}

const updateProfile = async (uuid, editedValues) => {
  try {
    if (editedValues.newPassword)
      editedValues.password = await bcrypt.hash(editedValues.newPassword, 10);
    let cypher = "MATCH (u:User {uuid: $uuid})\n";
    for (var key in editedValues) { cypher += `SET u.${key} = $${key}\n` }
    await session.run(cypher, {
      ...editedValues,
      uuid: uuid
    });
    session.close();
  } catch(error) { Log.error(error, "updateProfile", __filename) }
}

const getUserByUsername = async username => { 
  try {
    const res = await session.run(`
      MATCH (u:User {username: $username})
      RETURN 
      u.password AS password,
      u.uuid AS uuid,
      u.confirmed AS confirmed
    `, { username: username });
    session.close();
    if (res.records[0] !== undefined) {
      const password = res.records[0].get('password');
      const uuid = res.records[0].get('uuid');
      const confirmed = res.records[0].get('confirmed');
      const user = { password, uuid, confirmed };
      return user;
    } else {
      return null;
    }
  } catch(error) { Log.error(error, "getUserByUsername", __filename) }
}

const getProfileByUuid = async uuid => {
  try {
    const res = await session.run(`
    MATCH (u:User {uuid: $uuid})
    OPTIONAL MATCH (u)-[:TAGGED]->(t:Tag)
    WITH u, t, u.lastConnection.year AS year, u.lastConnection.month AS month, u.lastConnection.day AS day, u.lastConnection.hour AS hour, u.lastConnection.minute AS minute
    RETURN
    u,
    year+'-'+month+'-'+day+' '+hour+':'+minute AS lastConnection,
    duration.between(date(u.birthDate),date()).years AS age,
    collect(t.tag) AS tags
    `, {uuid: uuid});
    session.close();
    const user = res.records[0].get(`u`).properties;
    delete user['password'];
    delete user['hash'];
    delete user[`uuid`];
    const age = res.records[0].get(`age`) ? res.records[0].get(`age`).low : null;
    const tags = res.records[0].get(`tags`);
    const lastConnection = res.records[0].get(`lastConnection`);
    return {
      ...user, age, tags, lastConnection
    }
  } catch(error) { Log.error(error, "getProfile", __filename) }
}

const getRelationWithUser = async (uuid, targetUuid) => {
  try {
    const res = await session.run(`
    MATCH (u:User {uuid: $uuid}), (t:User {uuid: $targetUuid})
    RETURN
    exists((u)-[:LIKED]->(t)) AS liked,
    exists((t)-[:LIKED]->(u)) AS likedBy,
    exists((u)-[:VISITED]->(t)) AS visited,
    exists((t)-[:VISITED]->(u)) AS visitedBy,
    exists((t)-[:BLOCKED]->(u)) AS blockedBy,
    exists((u)-[:BLOCKED]->(t)) AS blocked
    `, {
      uuid: uuid,
      targetUuid: targetUuid
    });
    session.close();
    const ret = {
      liked: res.records[0].get(`liked`),
      likedBy: res.records[0].get(`likedBy`),
      visited: res.records[0].get('visited'),
      visitedBy: res.records[0].get('visitedBy'),
      blocked: res.records[0].get(`blocked`),
      blockedBy: res.records[0].get(`blockedBy`),
      match: res.records[0].get(`likedBy`) && res.records[0].get(`liked`),
    }
    return ret;
  } catch(error) { Log.error(error, "getRelationWithUser", __filename) }
}

const getHistoric = async (uuid, type) => {
  try {
    const res = await session.run(`
      MATCH (u:User {uuid: $uuid})
      MATCH (t:User)-[r:${type}]->(u)
      RETURN 
      t AS user,
      duration.between(date(t.birthDate),date()).years AS age,
      toString(r.timestamp) AS timestamp
      ORDER BY r.timestamp DESC
    `, { uuid: uuid })
    session.close();
    const historic = []
    for (i = 0; i < res.records.length; i++) {
      const user = res.records[i].get(`user`).properties;
      delete user['password'];
      delete user['hash'];
      delete user[`uuid`];
      historic.push({
          relTime : new Date(parseInt(res.records[i].get(`timestamp`))),
          age : res.records[i].get(`age`).low,
          ...user,
      })
    }
    return historic
  } catch(error) { Log.error(error, "getHistoric", __filename) }
}

const getBlockedList = async uuid => {
  try {
    const res = await session.run(`
      MATCH (u:User {uuid: $uuid})
      MATCH (u)-[r:BLOCKED]->(t:User)
      RETURN 
      t AS user,
      duration.between(date(t.birthDate),date()).years AS age,
      toString(r.timestamp) AS timestamp
      ORDER BY r.timestamp 
    `, { uuid: uuid })
    session.close();
    const historic = []
    for (i = 0; i < res.records.length; i++) {
      const user = res.records[i].get(`user`).properties;
      delete user['password'];
      delete user['hash'];
      delete user[`uuid`];
      historic.push({
          relTime : new Date(parseInt(res.records[i].get(`timestamp`))),
          age : res.records[i].get(`age`).low,
          ...user,
      })
    }
    return historic;
  } catch(error) { Log.error(error, "getBlockedList", __filename) }
}

const createRelationship = async (type, userUuid, targetUserId) => {
  try {
    let points = 0;
    if (type === 'liked') points = +100.0;
    if (type === 'disliked') points = -10.0;
    res = await session.run(`
      MATCH (u:User {uuid: $userUuid}), (t:User {userId: $targetUserId})
      OPTIONAL MATCH (u)-[dr:${type.toUpperCase()}]->(t)
      DELETE dr
      CREATE (u)-[r:${type.toUpperCase()}]->(t)
      WITH u, r, t, (CASE WHEN t.score + $points < 0 THEN 0.0 ELSE t.score + $points END) AS newScore
      SET t.score = newScore
      RETURN 
      exists((t)-[:LIKED]->(u)) AS match,
      u.userId AS userId
    `, {
      userUuid,
      targetUserId,
      points,
    })
    session.close();
    if (type === "liked" && res.records[0].get('match')) {
      createMatch(res.records[0].get(`userId`), targetUserId)
      return 'matched';
    } else {
      return type;
    }
  } catch(error) { Log.error(error, "createRelationship", __filename) }
}

const deleteRelationship = async (type, userId, targetUserId) => {
  try {
    let points = 0;
    if (type === 'liked') points = -100.0;
    const res = await session.run(`
      MATCH (u:User {userId: $userId}), (t:User {userId: $targetUserId})
      MATCH (u)-[r:${type.toUpperCase()}]->(t)
      OPTIONAL MATCH (m:Match)
      WHERE $userId IN m.userIds AND $targetUserId IN m.userIds
      WITH r, m, t, (CASE WHEN t.score + $points < 0 THEN 0.0 ELSE t.score + $points END) AS newScore
      SET t.score = newScore
      DELETE r
      RETURN count(m) AS match
    `, {
      userId,
      targetUserId,
      points,
    })
    if (type === "liked" && res.records[0].get(`match`)) {
      deleteMatch(userId, targetUserId);
    }
  } catch (error) { Log.error(error, "deleteRelationship", __filename) }
}

const createMatch = async (userId1, userId2) => {
  await deleteMatch(userId1, userId2);
  const res = await session.run(`
  MATCH (u1:User {userId: $userId1}), (u2:User {userId: $userId2})
  SET u1.score = u1.score + 500
  SET u2.score = u2.score + 500
  CREATE (m:Match {
      userIds: $userIds,
      matchId: $matchId,
      dateTime: DateTime({timezone: 'Europe/Paris'})
  })
  RETURN m.matchId
  `, {
      userIds: [userId1, userId2],
      matchId: uuidv1(),
      userId1,
      userId2,
  })
  session.close();
}

const deleteMatch = async (userId1, userId2) => {
  await session.run(`
  MATCH (m:Match)
  WHERE $userId1 IN m.userIds AND $userId2 IN m.userIds
  WITH m
  OPTIONAL MATCH (msg:Message {matchId: m.matchId})
  DELETE m, msg
  `, {
      userId1, userId2
  })
}

async function updateRelationship(uuid, { choice, username }) { 
  const relation = {
    'like': 'CREATE (me)-[r:LIKED]->(other)',
    'dislike': 'CREATE (me)-[r:DISLIKED]->(other)'
  }
  try {
    const res = await session.run(`
      MATCH (me:User {uuid: $uuid}), (other:User {username: $username})
      ${relation[choice]}
      SET r.timestamp = timestamp()
    `, { 
      uuid: uuid,
      username: username,
    });
    session.close();
  } catch(err) { console.log(err) }
}

const removeTag = async (uuid, req) => {
  try {
    await session.run(`
      MATCH (u:User {uuid: $uuid}), (t:Tag {tag: $tag})
      MATCH (u)-[r:TAGGED]->(t)
      DELETE r
    `, {
      uuid: uuid,
      tag: req.tag,
    });
    session.close();
  } catch(error) { Log.error(error, `removeTag`, __filename) }
}

const addTag = async (uuid, req) => {
  try {
    await session.run(`
      MATCH (u:User {uuid: $uuid}), (t:Tag {tag: $tag})
      CREATE (u)-[r:TAGGED]->(t)
    `, {
      uuid: uuid,
      tag: req.tag,
    });
    session.close();
  } catch(error) { Log.error(error, `removeTag`, __filename) }
}

const getUuidByHash = async ({ hash }) => { 
  try {
    const res = await session.run(`
      MATCH (me:User {hash: $hash})
      RETURN me.uuid AS uuid
    `, { hash: hash });
    session.close();
    if (res.records[0] === undefined)
      return null;
    const uuid = res.records[0].get('uuid');
    return uuid;
  } catch(error) { Log.error(error, "getUuidByHash", __filename) }
}

async function userIdFromUsername(username) { 
  try {
    const res = await session.run(`
      MATCH (u:User {username: $username})
      RETURN u.userId AS userId
    `, { username: username });
    session.close();
    if (res.records[0] === undefined) return null;
    const userId = res.records[0].get('userId');
    return userId;
  } catch(err) { console.log(err) }
}

const confirmUser = async uuid => { 
  try {
    await session.run(`
      MATCH (me:User {uuid: $uuid})
      SET me.confirmed = true
    `, { uuid: uuid });
    session.close();
  } catch(error) { Log.error(error, "confirmUser", __filename) }
}

const resetPasswordEmail = async email => { 
  try {
    const res = await session.run(`
      MATCH (u:User)
      WHERE u.email = $email
      RETURN u.hash AS hash
    `, { email: email });
    session.close();
    if (res.records[0] === undefined) 
      return null;
    const hash = res.records[0].get('hash');
    sendEmail('resetPassword', email, hash);
    return;
  } catch(error) { Log.error(error, "resetPasswordEmail", __filename) }
}

async function resetPassword({ hash, newPassword }) { 
  await bcrypt.hash(newPassword, 10, async (error, hashedPassword) => {
    try {
      const res = await session.run(`
        MATCH (u:User)
        WHERE u.hash = $hash
        SET u.password = $hashedPassword
        RETURN u.username AS username
      `,
      { 
        hash: hash,
        hashedPassword: hashedPassword,
      });
      session.close();
      if (res.records[0] === undefined) return null;
      const username = res.records[0].get('username');
      return username;
    } catch(err) { console.log(err) }
  })
}

async function hasFullProfile(uuid) { 
  try {
    const res = await session.run(`
      MATCH (u:User)
      WHERE u.uuid = $uuid
      RETURN u.lookingFor AS lookingFor, 
      u.gender AS gender,
      u.birthDate AS birthDate,
      u.orientation AS orientation,
      u.photos AS photos
    `,
    { uuid: uuid });
    session.close();
    if (res.records[0] === undefined) return null;
    const lookingFor = res.records[0].get('lookingFor');
    const gender = res.records[0].get('gender');
    const birthDate = res.records[0].get('birthDate');
    const orientation = res.records[0].get('orientation');
    const hasPhoto = res.records[0].get('photos').length > 0;
    return { lookingFor, gender, birthDate, orientation, hasPhoto };
  } catch(err) { console.log(err) }
}

async function userIdFromUuid(uuid) { 
  try {
    const res = await session.run(`
      MATCH (u:User {uuid: $uuid})
      RETURN u.userId AS userId
    `, { uuid: uuid });
    session.close();
    if (res.records[0] === undefined) return null;
    const userId = res.records[0].get('userId');
    return userId;
  } catch(err) { console.log(err) }
}

async function usernameFromUserId(userId) { 
  try {
    const res = await session.run(`
      MATCH (u:User {userId: $userId})
      RETURN u.username AS username
    `, { userId: userId });
    session.close();
    if (res.records[0] === undefined) return null;
    const username = res.records[0].get('username');
    return username;
  } catch(err) { console.log(err) }
}

async function uuidFromUsername(username) { // refacto possible avec getUserByUsername
  try {
    const res = await session.run(`
      MATCH (u:User {username: $username})
      RETURN u.uuid AS uuid
    `, { username: username });
    session.close();
    if (res.records[0] === undefined) return null;
    const uuid = res.records[0].get('uuid');
    return uuid;
  } catch(err) { console.log(err) }
}

const createReportTicket = async (userUuid, targetUserId) => {
  try {
    await session.run(`
      MATCH (u:User {uuid: $userUuid})
      CREATE (r:Report {
        from: u.userId,
        to: $to,
        dateTime: DateTime()
      })
    `, {
      userUuid,
      to: targetUserId
    })
  } catch(error) { Log.error(error, `createReportTicket`, __filename) }
}

async function getUuidByUserId(userId) {
  try {
    const res = await session.run(`
      MATCH (u:User {userId: $userId})
      RETURN u.uuid AS uuid
    `, { userId: userId });
    session.close();
    if (res.records[0] === undefined) return null;
    const uuid = res.records[0].get('uuid');
    return uuid;
  } catch(err) { console.log(err) }
}

async function setlastConnection(userId) {
  try {
    await session.run(`
      MATCH (u:User {userId: $userId})
      SET u.lastConnection = DateTime({timezone: 'Europe/Paris'})
    `, { userId: userId });
    session.close();
  } catch(err) { console.log(err) }
}

async function addPicture(uuid, publicId) {
  try {
    const res = await session.run(`
    MATCH (u:User {uuid: $uuid})
    RETURN u.photos
    `, {uuid: uuid})
    const photos = res.records[0].get(0)
    photos.push(publicId.toString());
    await session.run(`
      MATCH (u:User {uuid: $uuid})
      SET u.photos = $photos
    `, { uuid, publicId, photos })
  } catch(err) { console.log(err) }
}

async function deleteAllRelationships(userId) {
  try {
    await session.run(`
      MATCH (u:User {userId: $userId})
      OPTIONAL MATCH (u)-[l:LIKED]-()
      OPTIONAL MATCH (u)-[v:VISITED]-()
      OPTIONAL MATCH (m:Match)
      WHERE $userId IN m.userIds
      DELETE l, v, m
    `, {userId})
  } catch(err) { console.log(err) }
}

const blockUser = async (userId, targetUserId) => {
  try {
    res = await session.run(`
      MATCH (u:User {userId: $userId}), (t:User {userId: $targetUserId})
      OPTIONAL MATCH (u)-[l:LIKED]-(t)
      OPTIONAL MATCH (u)-[v:VISITED]-(t)
      OPTIONAL MATCH (m:Match)
      WHERE $userId IN m.userIds AND $targetUserId IN m.userIds
      CREATE (u)-[:BLOCKED]->(t)
      DELETE l, v, m
    `, {
      userId,
      targetUserId,
    })
    session.close();
  } catch(error) { Log.error(error, "blockUser", __filename) }
}

module.exports = {
  getUserByUsername,
  createRelationship,
  deleteRelationship,
  getHistoric,
  confirmUser,
  getUuidByHash,
  createUser,
  usernameExists,
  emailExists,
  uuidExists,
  getProfileByUuid,
  updateProfile,
  addTag,
  removeTag,
  updateRelationship,
  resetPasswordEmail,
  resetPassword,
  hasFullProfile,
  userIdFromUuid,
  userIdFromUsername,
  usernameFromUserId,
  uuidFromUsername,
  getBlockedList,
  createReportTicket,
  getRelationWithUser,
  getUuidByUserId,
  setlastConnection,
  createMatch,
  deleteMatch,
  addPicture,
  deleteAllRelationships,
  blockUser
}