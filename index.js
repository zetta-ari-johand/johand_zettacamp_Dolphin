require('dotenv').config();
const purchaseBook = require('./controller/purchaseBookController');
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const mongoose = require('mongoose');
const config = require('./config/db.json');

// // const url = 'mongodb://docker-host-ip:27017/';
// const url = 'mongodb://localhost:27017/';
// const database = 'Book-Purchase-Database'; // define db name

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
