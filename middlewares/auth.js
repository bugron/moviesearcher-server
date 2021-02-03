const auth = require('basic-auth');

const authMiddleware = (req, res, next) => {
  // don't care about actual credentials
  // just check if they are passed in a request
  const credentials = auth(req);

  if (!credentials) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="moviesearcher"');
    res.end('Access denied');
  } else {
    next();
  }
}

module.exports = authMiddleware;
