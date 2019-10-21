const axios = require('axios');

const actionLogin = (token) => {
    localStorage.setItem('token', token);
};

const actionIsAuthenticated = async authToken => {
    if (authToken) {
        const res = await axios.get(`/auth?authToken=${authToken}`);
        return res.data.userId;
    } else {
        return false;
    }
};

const actionLogout = () => {
    localStorage.removeItem('token');
};

module.exports = {
    actionLogin,
    actionIsAuthenticated,
    actionLogout,
};
