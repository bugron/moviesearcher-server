require('dotenv').config();

const express = require('express');
const routes = require('./routes');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());

app.use(routes);

const PORT = process.env.PORT || 8970;

app.listen(PORT, function listener() {
  console.log(`Ready to serve packages at localhost:${PORT}...`);
});
