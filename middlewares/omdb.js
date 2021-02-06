const axios = require('axios');
const redis = require('redis');
const client = redis.createClient();
 
client.on('error', function(error) {
  console.error(error);
});

const omdbMiddleware = (req, res, next) => {
  const RESULTS_PER_PAGE = 10; // OMDb gives 10 items per page
  const { t, y = '', type = '', page = 1 } = req.query;
  // Create a key based on the request to cache search results
  const requestKey = `title:${t}-year:${y}-type:${type}-page:${page}`;

  client.get(requestKey, (err, chachedData) => {
    if (err) throw err;

    // If our search request is already cached
    // Then simply return cached results
    if (chachedData) {
      res.json(JSON.parse(chachedData));
    } else {
      // Otherwise make get data from omdb
      axios.get(`http://www.omdbapi.com/?apikey=3792a375&s=${t}&y=${y}&type=${type}&page=${page}`)
        .then(({ data }) => {
          let searchData = {};
          // Add some pagination info to the results
          if (page * RESULTS_PER_PAGE < +data.totalResults) {
            searchData = Object.assign({}, data, { nextPage: Number(page) + 1 });
          } else {
            searchData = data;
          }
          // And finally cache the results
          client.set(requestKey, JSON.stringify(searchData), (err) => {
            if (err) throw err;
            // And return the data to the client
            res.json(searchData);
          })
        })
    }
  })
};

module.exports = omdbMiddleware;
