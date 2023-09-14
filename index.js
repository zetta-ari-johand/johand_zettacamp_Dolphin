require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

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
