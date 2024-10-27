// auth.js
const basicAuth = require('basic-auth');

const auth = (req, res, next) => {
    const user = basicAuth(req);

    if (!user || !user.name || !user.pass) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.sendStatus(401);
    }

    if (user.name === process.env.AUTH_USERNAME && user.pass === process.env.AUTH_PASSWORD) {
        return next();
    } else {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.sendStatus(401);
    }
};

module.exports = auth;