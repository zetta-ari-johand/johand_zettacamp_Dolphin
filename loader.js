const DataLoader = require('dataloader'); // Import DataLoader
const SongModel = require('./models/songModel');
const PlaylistModel = require('./models/playlistModel');

// TO LOAD PLAYLIST
const playlistLoader = new DataLoader(async (playlistIds) => {
  const playlists = await PlaylistModel.find({
    _id: { $in: playlistIds },
  });

  const playlistMap = {};
  playlists.forEach((playlist) => {
    playlistMap[playlist._id] = playlist;
  });

  return playlistIds.map((playlistId) => playlistMap[playlistId] || null); // return null for missing playlistIds
  // ensure if theres song with null playlist, its still included in the result
});

// const playlistLoader = new DataLoader(getPlaylists);

// TO LOAD SONG
const songLoader = new DataLoader(async (songIds) => {
  const songs = await SongModel.find({
    _id: { $in: songIds },
  });

  const songMap = {};
  songs.forEach((song) => {
    songMap[song._id.toString()] = song;
  });

  return songIds.map((songId) => songMap[songId]);
});

module.exports = { playlistLoader, songLoader };
