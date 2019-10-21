const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const config = require('../middlewares/config');
const Log = require(`../tools/Log`);
const cloudinary = require(`../tools/Cloudinary`);
const bcrypt = require('bcrypt')


const emailIsOK = email => {
      const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(String(email).toLowerCase());
};
const firstNameIsOK = firstName => {
      const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ-]{3,15}$/;
      return regex.test(String(firstName));
};
const lastNameIsOK = lastName => {
      const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ]{3,15}$/;
      return regex.test(String(lastName));
};
const usernameIsOK = username => {
      const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ]{5,10}$/;
      return regex.test(String(username));
};
const passwordIsOK = password => {
      const regex = /^(?:(?=.*?[A-Z])(?:(?=.*?[0-9])(?=.*?[-!@#$%^&*()_[\]{},.<>+=])|(?=.*?[a-z])(?:(?=.*?[0-9])|(?=.*?[-!@#$%^&*()_[\]{},.<>+=])))|(?=.*?[a-z])(?=.*?[0-9])(?=.*?[-!@#$%^&*()_[\]{},.<>+=]))[A-Za-z0-9!@#$%^&*()_[\]{},.<>+=-]{6,50}$/;
      return regex.test(String(password));
};

const createUser = (req, res) => {
      try {
            const newUserIsOK = async (email, firstName, lastName, username, password) => {
                  const helpers = {
                        errors: [],
                        taken: [],
                  };
                  if (!emailIsOK(email)) { helpers.errors.push('email') };
                  if (!firstNameIsOK(firstName)) { helpers.errors.push('firstName') };
                  if (!lastNameIsOK(lastName)) { helpers.errors.push('lastName') };
                  if (!usernameIsOK(username)) { helpers.errors.push('username') };
                  if (!passwordIsOK(password)) { helpers.errors.push('password') };
                  const emailExists = await UserModel.emailExists(email);;
                  if (emailExists) { helpers.taken.push('email') };
                  const usernameExists = await UserModel.usernameExists(username);
                  if (usernameExists) { helpers.taken.push('username') };
                  return helpers;
            };
            
            const manageNewUser = async ({ email, firstName, lastName, username, password, city, latLng }) => {
                  const helpers = await newUserIsOK(email, firstName, lastName, username, password);
                  if (helpers.errors.length !== 0 || helpers.taken.length !== 0) {
                        res.status(400).json(helpers);
                        return;
                  }
                  await UserModel.createUser(email, firstName, lastName, username, password, city, latLng);
                  res.status(200).json({ message: 'User created' });
            };
            manageNewUser(req.body);
      } catch (error) { Log.error(error, `createUser`, __filename) }
};

const getUuidFromToken = async (req, res) => {
      try {
            const token = req.body.authToken || req.query.authToken;
            const uuid = await jwt.verify(token, config.jwtSecret, (err, decoded) => {
                  if (err) res.status(401).send('Unauthorized: Invalid token');
                  return decoded.uuid;
            });
            return uuid;
      } catch (error) { Log.error(error, `getUuidFromToken`, __filename) }
}
    
const getCurrentProfile = async (req, res) => {
      try {
            const uuid = await getUuidFromToken(req, res);
            if (uuid) {
                  const profile = await UserModel.getProfileByUuid(uuid);
                  profile.account = false;
                  profile.visitedHistoric = await UserModel.getHistoric(uuid, "VISITED");
                  profile.likedHistoric = await UserModel.getHistoric(uuid, "LIKED");
                  profile.blockedList = await UserModel.getBlockedList(uuid);
                  profile.account = true;
                  res.json({profile: profile})
            }
      } catch (error) { Log.error(error, `getCurrentProfile`, __filename) }
}

const getProfile = async (req, res) => {
      try {
            const uuid = await getUuidFromToken(req, res);
            const reqUser = await UserModel.getUserByUsername(req.params.username);
            if (reqUser === null) res.send('unknown user');
            else {
                  const user = await UserModel.getProfileByUuid(uuid);
                  const profile = await UserModel.getProfileByUuid(reqUser.uuid);
                  profile.account = false;
                  if (uuid === reqUser.uuid) {
                        profile.visitedHistoric = await UserModel.getHistoric(uuid, "VISITED");
                        profile.likedHistoric = await UserModel.getHistoric(uuid, "LIKED");
                        profile.blockedList = await UserModel.getBlockedList(uuid);
                        profile.account = true;
                        profile.inSearch = true;
                  } else {
                        const ret = await UserModel.getRelationWithUser(uuid, reqUser.uuid)
                        profile.liked = ret.liked;
                        profile.likedBy = ret.likedBy;
                        profile.blocked = ret.blocked;
                        profile.blockedBy = ret.blockedBy;
                        profile.visited = ret.visited;
                        profile.visitedBy = ret.visitedBy;
                        profile.inSearch = user.lookingFor.includes(profile.gender) ? true : false;
                  }
                  res.status(200).json({profile: profile});
            }
      } catch (error) { Log.error(error, `getProfile`, __filename) }
}

const updateProfile = async (req, res) => {
      try {
            const uuid = await getUuidFromToken(req, res);
            const profile = await UserModel.getProfileByUuid(uuid);
            const user = await UserModel.getUserByUsername(profile.username)
            const keys = Object.keys(req.body);
            const errors = [];
            if (keys.includes('gender') || keys.includes('orientation') || keys.includes('birthDate') || keys.includes('lookingFor'))
                  UserModel.deleteAllRelationships(profile.userId);
            if (keys.includes('email')) { 
                  if (!emailIsOK(req.body.email)) errors.push('invalidEmail');
                  if (await UserModel.emailExists(req.body.email)) errors.push('emailTaken')
            };
            if (keys.includes('firstName') && !firstNameIsOK(req.body.firstName)) { errors.push('invalidFirstName') };
            if (keys.includes('lastName') && !lastNameIsOK(req.body.lastName)) { errors.push('invalidLastName') };
            if (keys.includes('username')) {
                  if (!usernameIsOK(req.body.username)) errors.push('invalidUsername');
                  if (!UserModel.usernameExists(req.body.username)) errors.push('usernameTaken')
            };
            if (keys.includes('newPassword')) {
                  bcrypt.compare(req.body.prevPassword, user.password, (error, res) => {
                        if (!res) errors.push('wrongCurrentPassword') 
                  });
                  if (!passwordIsOK(req.body.newPassword)) errors.push('invalidPassword');
            }
            if (errors.length > 0) {
                  res.status(400).json({errors});
            } else {
                  if (keys.includes('gender') || keys.includes('birthDate'))
                        await UserModel.deleteAllRelationships(profile.userId);
                  await UserModel.updateProfile(uuid, req.body);
                  res.status(200).json({ message: 'Profile updated.' });
            }
      } catch (error) { Log.error(error, `updateProfile`, __filename) }
}

const addTag = async (req, res) => {
      try {
            const uuid = await getUuidFromToken(req, res);
            if (uuid) {
                  await UserModel.addTag(uuid, req.body);
                  res.json({message: "Tag relationship created."});
            }
      } catch (error) { Log.error(error, `addTag`, __filename) }
}

const confirmUser = async (req, res) => {
      try {
            const uuid = await UserModel.getUuidByHash(req.body);
            if (uuid !== null) {
                  await UserModel.confirmUser(uuid)
                  res.status(200).json({ message: 'Confirmation is set in db' });
            } else { res.status(400).json({ message: 'Hash is not OK' }) }
      } catch (error) { Log.error(error, `confirmUser`, __filename) }
};

const resetPasswordEmail = (req, res) => {
      try {
            const { email } = req.body;
            UserModel.resetPasswordEmail(email)
                  .then(hash => {res.status(200).json({ message: 'Reset request treated' })})
                  .catch(err => res.status(200).json({ message: 'Reset request treated' }))
      } catch (error) { Log.error(error, `resetPasswordEmail`, __filename) }
}

const removeTag = async (req, res) => {
      try {
            const uuid = await getUuidFromToken(req, res);
            if (uuid) {
                  await UserModel.removeTag(uuid, req.body)
                  res.status(200).json({ message: 'Tag removed.' });
            }
      } catch (error) { Log.error(error, `removeTag`, __filename) }
}

const createRelationship = async (req, res) => {
      try {
            const uuid = await getUuidFromToken(req, res);
            const user = await UserModel.getProfileByUuid(uuid);
            if (req.body.type === "liked" && user.photos.length === 0) {
                  res.status(400).send('Cannot create relationship')
            } else {
                  const type = await UserModel.createRelationship(req.body.type, uuid, req.body.targetUserId);
                  res.status(200).json({ type })
            }
      } catch (error) { Log.error(error, `createRelationship`, __filename) }
}

const deleteRelationship = async (req, res) => {
      try {
            const uuid = await getUuidFromToken(req, res);
            const profile = await UserModel.getProfileByUuid(uuid);
            await UserModel.deleteRelationship(req.body.type, profile.userId, req.body.targetUserId);
            res.status(200).json({ message: `${req.body.type} relationship deleted.`})
      } catch (error) { Log.error(error, `deleteRelationship`, __filename) }
}

const uploadPic = async (req, res) => {
      try {
            const uuid = await getUuidFromToken(req, res);
            const publicId = Date.now();
            await cloudinary.uploader.upload(req.body.image, { public_id: Date.now() })
            await UserModel.addPicture(uuid, publicId);
            res.status(200).json({ message: `Picture uploaded.` })
      } catch (error) { Log.error(error, `uploadPic`, __filename) }
}

const updateRelationship = (req, res) => {
      const token = req.body.authToken || req.query.authToken;
      jwt.verify(token, config.jwtSecret, async (err, decoded) => {
            UserModel.updateRelationship(decoded.uuid, req.body)
                  .then(users => { res.json({usersArr: users}) })
                  .catch(err => { console.log(err) })
      });
}

const resetPassword = (req, res) => {
      const regex = /^(?:(?=.*?[A-Z])(?:(?=.*?[0-9])(?=.*?[-!@#$%^&*()_[\]{},.<>+=])|(?=.*?[a-z])(?:(?=.*?[0-9])|(?=.*?[-!@#$%^&*()_[\]{},.<>+=])))|(?=.*?[a-z])(?=.*?[0-9])(?=.*?[-!@#$%^&*()_[\]{},.<>+=]))[A-Za-z0-9!@#$%^&*()_[\]{},.<>+=-]{6,50}$/;
      if (regex.test(String(req.body.newPassword))) {
            UserModel.resetPassword(req.body)
                  .then(username => {
                        if (username !== null) {
                              res.status(200).json({ message: 'New Password Set', username: username });
                        } else {
                              res.status(401).send('Wrong hash provided');
                        }
                  })
                  .catch(err => res.status(400).send('Invalid email'));
      } else {
            res.status(400).send('Invalid email');
      }
};

const hasFullProfile = (req, res) => {
      const token = req.body.authToken || req.query.authToken;
      jwt.verify(token, config.jwtSecret, async (err, decoded) => {
            UserModel.hasFullProfile(decoded.uuid)
                  .then(fields => res.status(200).json({ fields }))
                  .catch(err => res.status(400).send('Error'));
      });
};

const userIdFromUuid = (req, res) => {
      const token = req.body.authToken || req.query.authToken;
      jwt.verify(token, config.jwtSecret, async (err, decoded) => {
            try {
                  const userId = await UserModel.userIdFromUuid(decoded.uuid);
                  res.status(200).json({ userId });
            } catch(err) {
                  res.status(400).send('Error');
            }
      });
};

const reportUser = async (req, res) => {
      const uuid = await getUuidFromToken(req, res);
      const { targetUserId } = req.body;
      await UserModel.createReportTicket(uuid, targetUserId);
      res.status(200).send('User reported.');
}

const blockUser = async (req, res) => {
      const uuid = await getUuidFromToken(req, res);
      const user = await UserModel.getProfileByUuid(uuid);
      const { targetUserId } = req.body;
      await UserModel.blockUser(user.userId, targetUserId);
      res.status(200).send('User blocked.');
}

module.exports = {
      createUser,
      getProfile,
      updateProfile,
      addTag,
      removeTag,
      confirmUser,
      getCurrentProfile,
      createRelationship,
      deleteRelationship,
      uploadPic,
      updateRelationship,
      resetPasswordEmail,
      resetPassword,
      hasFullProfile,
      userIdFromUuid,
      reportUser,
      blockUser
}
