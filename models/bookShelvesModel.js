const mongoose = require('mongoose');

const bookshelvesSchema = new mongoose.Schema(
  {
    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookPurchase', // reference to the 'BookPurchase' model
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
