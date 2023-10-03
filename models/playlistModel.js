const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String },
    songIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;
