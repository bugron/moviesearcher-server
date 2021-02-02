const auth = require('basic-auth');
const axios = require('axios');
const router = require('express').Router();
const redis = require("redis");
const client = redis.createClient();
 
client.on("error", function(error) {
  console.error(error);
});

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

const omdbMiddleware = (req, res, next) => {
  console.log(req.query);
  // return res.json({ text: 'hello' });

  const { t, y = '', type = '', page = 1} = req.query;
  // OMDB API request string: 
  const requestKey = `title:${t}-year:${y}-type:${type}-page:${page}`;
  console.log('requestKey', requestKey);
  client.get(requestKey, (err, value) => {
    if (err) throw err;

    console.log('db:value', value);

    if (value) {
      res.json(JSON.parse(value));
    } else {
      axios.get(`http://www.omdbapi.com/?apikey=3792a375&s=${t}&y=${y}&type=${type}&page=${page}`)
        .then(({ data }) => {
          console.log('axios:data', data);
          let newData = {};
          if (page * 10 < +data.totalResults) {
            newData = Object.assign({}, data, { nextPage: Number(page) + 1 });
          } else {
            newData = data;
          }
          client.set(requestKey, JSON.stringify(newData), (err) => {
            if (err) throw err;
            console.log('Respoinding with data');
            res.json(newData);
          })
        })
    }
  })
};

router.get('/api/search', authMiddleware, omdbMiddleware);

module.exports = router;
