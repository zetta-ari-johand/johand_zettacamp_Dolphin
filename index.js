require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 5500;
const mongoose = require('mongoose');
const config = require('./config/db.json');

// connect to db
mongoose
  .connect(config.mongoURI, {
    // URI = MongoDB Uniform Resource Identifier
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to mongoDB');
  })
  .catch((error) => {
    console.log('error connect to mongoDB', error);
  });
// import router
const indexRouter = require('./router/indexRouter');

//parses incoming HTTP requests with JSON
app.use(express.json());

//router
app.use(indexRouter);

//healthcheck
app.get('/healthcheck', (req, res) => {
  res.send(true);
});

app.listen(port, () => {
  console.log(`port is running at ${port}`);
});
