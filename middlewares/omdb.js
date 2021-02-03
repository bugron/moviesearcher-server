const axios = require('axios');
const redis = require('redis');
const client = redis.createClient();
 
client.on('error', function(error) {
  console.error(error);
});

const omdbMiddleware = (req, res, next) => {
  const { t, y = '', type = '', page = 1 } = req.query;
  // Create a key based on the request to cache search results
  const requestKey = `title:${t}-year:${y}-type:${type}-page:${page}`;

  client.get(requestKey, (err, value) => {
    if (err) throw err;

    // If our search request is already cached
    // Then simply return cached results
    if (value) {
      res.json(JSON.parse(value));
    } else {
      // Otherwise make get data from omdb
      axios.get(`http://www.omdbapi.com/?apikey=3792a375&s=${t}&y=${y}&type=${type}&page=${page}`)
        .then(({ data }) => {
          let newData = {};
          // Add some pagination info to the results
          if (page * 10 < +data.totalResults) {
            newData = Object.assign({}, data, { nextPage: Number(page) + 1 });
          } else {
            newData = data;
          }
          // And finally cache the results
          client.set(requestKey, JSON.stringify(newData), (err) => {
            if (err) throw err;
            // And return the data to the client
            res.json(newData);
          })
        })
    }
  })
};

module.exports = omdbMiddleware;
