const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    socialMedia: {
      instagram: String,
      x: String,
      reddit: String,
    },
  },
  {
    timestamps: true,
  }
);

const AuthorModel = mongoose.model('author', authorSchema);

module.exports = AuthorModel;
