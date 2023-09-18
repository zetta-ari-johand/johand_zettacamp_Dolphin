const mongoose = require('mongoose');

const bookPurchaseSchema = new mongoose.Schema(
  {
    bookTitle: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Types.ObjectId,
      ref: 'author',
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 10,
    },
    quantity: {
      type: Number,
    },
    status: {
      // is the book available or not
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const BookPurchaseModel = mongoose.model('BookPurchase', bookPurchaseSchema);

module.exports = BookPurchaseModel;
