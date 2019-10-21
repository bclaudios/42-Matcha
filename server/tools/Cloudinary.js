const cloudinary = require(`cloudinary`).v2;

cloudinary.config({
    cloud_name: 'matchacn',
    api_key: '777469846424777',
    api_secret: 'Kjl5lrKUbh_AsE4hhrjnrjWy7aM'
});

module.exports = cloudinary