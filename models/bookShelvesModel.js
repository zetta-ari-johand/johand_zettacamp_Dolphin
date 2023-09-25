const mongoose = require('mongoose');

const bookshelvesSchema = new mongoose.Schema(
  {
    books: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'BookPurchase', // reference to the 'BookPurchase' model
        },
        price: {
          type: Number, // assuming the price is a number
        },
        stock: {
          type: Number,
        },
      },
    ],
    genre: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

const BookshelvesModel = mongoose.model('Bookshelves', bookshelvesSchema);

module.exports = BookshelvesModel;
