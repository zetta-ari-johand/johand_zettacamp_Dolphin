const { addPlaylistByArtist, addPlaylistByGenre, createRandomPlaylistLessThanHour } = require('../helper/JAVASCRIPT_DAY7'); // Adjust the path as needed
const Song = require('../models/songModel');
const Playlist = require('../models/playlistModel');

module.exports = {
  createPlaylist: async (req, res, next) => {
    try {
      const { artistName } = req.body;

      // find and delete the existing playlist by name
      await Playlist.findOneAndDelete({ name: `Playlist by ${artistName}` });

      //   const songsByArtist = await Song.find({ artist: artistName });
      const songsByArtist = await Song.find({ artist: { $in: artistName } });

      if (songsByArtist.length === 0) {
        return res.status(404).json({
          status: false,
          message: 'No songs found by this artist.',
        });
      }

      // create a new playlist and add songIds to it
      const playlist = new Playlist({
        name: `Playlist by ${artistName}`,
        songIds: songsByArtist.map((song) => song._id), // Map the IDs of songs
      });
      // save the playlist to the database
      const createPlaylist = await playlist.save();

      // update the song.playlistId field
      if (createPlaylist) {
        await Song.updateMany(
          {
            _id: { $in: playlist.songIds },
          },
          { playlistId: playlist._id, playlistBy: 'Artist' }
        );
      } else {
        return res.status(400).json({
          status: false,
          message: 'failed add new playlist',
        });
      }

      return res.status(200).json({
        status: true,
        message: 'Playlist added successfully',
        data: playlist,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        data: {
          message: 'nganu, ada error. semoga pesan2 dibawah ini bisa membantu',
          error: error.message,
        },
      });
    }
  },
  createPlaylistByGenre: async (req, res, next) => {
    try {
      const { songGenre } = req.body;

      // check duplicate
      const existingPlaylist = await Playlist.findOne({ name: `Playlist by genre ${songGenre}` });
      if (existingPlaylist) {
        // if the playlist exists, delete it
        await Playlist.findByIdAndRemove(existingPlaylist._id);
      }

      const songsByGenre = await Song.find({ genre: songGenre });

      if (songsByGenre.length === 0) {
        return res.status(404).json({
          status: false,
          message: 'No songs found by this genre.',
        });
      }

      // create a new playlist and add songIds to it
      const playlist = new Playlist({
        name: `Playlist by genre ${songGenre}`,
        songIds: songsByGenre.map((song) => song._id), // map the IDs of songs
      });
      // save the playlist to the database
      const createPlaylist = await playlist.save();

      // update the song.playlistId field
      if (createPlaylist) {
        await Song.updateMany(
          {
            _id: { $in: playlist.songIds },
          },
          { playlistId: playlist._id, playlistBy: 'Genre' }
        );
      } else {
        return res.status(400).json({
          status: false,
          message: 'failed add new playlist',
        });
      }

      return res.status(201).json({
        status: true,
        message: 'Playlist added successfully',
        data: playlist,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        data: {
          message: 'nganu, ada error. semoga pesan2 dibawah ini bisa membantu',
          error: error.message,
        },
      });
    }
  },
  getPlaylist: async (req, res, next) => {
    try {
      const { page, perPage } = req.query;

      // parse 'page' and 'perPage' as integers
      const pageNumber = parseInt(page, 10);
      const itemsPerPage = parseInt(perPage, 10);

      const playlistList = await Playlist.aggregate([
        {
          $match: {
            $expr: {
              // to use aggregation expressions to filter documents in a $match stage based on more complex conditions that involve the document's own fields
              $gt: [{ $size: '$songIds' }, 5], // size to calculate number of element in array
            },
          },
        },
        {
          $sort: { name: 1 }, // sort the playlists by name in ascending order
        },
        {
          $lookup: {
            from: 'songs', // replace with the actual collection name if needed
            localField: 'songIds',
            foreignField: '_id',
            as: 'songsInfo',
          },
        },
        {
          $facet: {
            totalCount: [{ $group: { _id: null, count: { $sum: 1 } } }],
            playlists: [
              { $skip: pageNumber * itemsPerPage }, // skip the specified number of pages
              { $limit: itemsPerPage }, // limit the number of playlists per page
            ],
          },
        },
        {
          $group: {
            _id: null,
            totalPlaylist: { $first: '$totalCount.count' }, // extract the total count
            playlists: { $first: '$playlists' }, // extract the playlists
          },
        },
        { $project: { 'playlists.__v': 0, 'playlists.createdAt': 0, 'playlists.updatedAt': 0 } },
      ]);
      if (playlistList.length < 1) {
        return res.status(400).json({
          status: true,
          message: 'No playlist yet',
        });
      }
      const response = {
        totalPlaylist: playlistList[0].totalPlaylist[0],
        currentPage: page,
        totalPage: Math.ceil(playlistList[0].totalPlaylist / perPage),
        list: playlistList,
      };

      //   const { totalPlaylist, playlists } = playlistList[0]; // Extract the total count and playlists

      return res.status(200).json({
        status: true,
        data: response,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        data: {
          message: 'nganu, ada error. semoga pesan2 dibawah ini bisa membantu',
          error: error.message,
        },
      });
    }
  },
  updatePlaylist: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateKeyValue = req.body;
      if (!id) {
        return res.status(400).json({
          status: true,
          message: 'Insert ID of playlist',
        });
      }

      let updateData = await Playlist.findByIdAndUpdate(id, updateKeyValue, { new: true });
      if (!updateData) {
        return res.status(400).json({
          status: true,
          message: 'No data found to be updated',
        });
      }
      return res.status(200).json({
        status: true,
        message: 'Success update playlist',
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        data: {
          message: 'nganu, ada error. semoga pesan2 dibawah ini bisa membantu',
          error: error.message,
        },
      });
    }
  },
  deletePlaylist: async (req, res, nextt) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          status: true,
          message: 'Insert ID of song',
        });
      }

      let deleteData = await Playlist.findByIdAndRemove(id);
      if (!deleteData) {
        return res.status(400).json({
          status: true,
          message: 'No data found to be deleted',
        });
      }
      return res.status(200).json({
        status: true,
        message: 'Success delete playlist',
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        data: {
          message: 'nganu, ada error. semoga pesan2 dibawah ini bisa membantu',
          error: error.message,
        },
      });
    }
  },
};
