require('dotenv').config();
const purchaseBook = require('./controller/purchaseBookController');
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

// app.post('/purchase-book', checkAuth, (req, res) => {
//   const { bookTitle, author, price, discountPercentage, taxPercentage, numToPurchase, availableStock, creditTerm } = req.body;

//   const requiredValues = ['bookTitle', 'author'];
//   const numericValues = ['price', 'discountPercentage', 'taxPercentage', 'numToPurchase', 'availableStock', 'creditTerm'];

//   // Check for missing required fields
//   for (const requiredValue of requiredValues) {
//     if (!req.body[requiredValue]) {
//       return res.status(422).json({
//         message: `${requiredValue} is missing`,
//       });
//     }
//   }

//   // Check for numeric fields (not missing, null, or undefined)
//   for (const field of numericValues) {
//     if (req.body[field] === undefined || req.body[field] === null) {
//       return res.status(422).json({
//         message: `${field} must not be empty`,
//       });
//     }
//   }

//   const purchaseResponse = purchaseBook(
//     bookTitle,
//     author,
//     price,
//     discountPercentage,
//     taxPercentage,
//     numToPurchase,
//     availableStock,
//     creditTerm
//   );

//   if (purchaseResponse) {
//     return res.status(200).json({
//       status: true,
//       response: purchaseResponse,
//     });
//   } else {
//     return res.status(400).json({
//       status: false,
//       message: 'Book purchase failed',
//     });
//   }
// });

app.listen(port, () => {
  console.log(`port is running atsss ${port}`);
});
