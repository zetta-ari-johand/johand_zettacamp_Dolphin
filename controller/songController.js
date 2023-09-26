const Song = require('../models/songModel');
const songsData = require('../helper/songs');

module.exports = {
  getAllSong: async (req, res, next) => {
    try {
      const { page, perPage } = req.query;

      // parse 'page' and 'perPage' as integers
      const pageNumber = parseInt(page, 10);
      const itemsPerPage = parseInt(perPage, 10);
      //   const songList = await Song.find();
      const songList = await Song.aggregate([
        // MATCH
        { $match: { genre: 'Rock' } },
        {
          $lookup: {
            from: 'playlists', // replace with the actual collection name if needed
            localField: 'playlistId',
            foreignField: '_id',
            as: 'playlistInfo',
          },
        },
        {
          $project: {
            'playlistInfo.songIds': 0,
          },
        },
        {
          // SORT
          $sort: { title: 1 },
        },
        {
          // FACET, GROUP, SKIP, LIMIT
          $facet: {
            totalCount: [{ $group: { _id: null, count: { $sum: 1 } } }],
            songs: [{ $skip: page * perPage }, { $limit: itemsPerPage }],
          },
        },
        {
          $project: {
            songs: '$songs',
            totalSongs: { $arrayElemAt: ['$totalCount.count', 0] },
          },
        },
      ]);
      if (songList.length < 1) {
        return res.status(400).json({
          status: true,
          message: 'No song yet',
        });
      }
      return res.status(200).json({
        status: true,
        data: {
          songs: songList,
          totalCount: songList[0].totalSongs,
          currentPage: page,
          totalPage: Math.ceil(songList[0].totalSongs / perPage),
        },
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
  createSong: async (req, res, next) => {
    try {
      const { title, artist, genre, duration } = req.body;
      const requiredValues = ['title', 'artist', 'genre', 'duration'];

      for (const requiredValue of requiredValues) {
        if (!req.body[requiredValue]) {
          return res.status(422).json({
            message: `${requiredValue} is missing`,
          });
        }
      }

      // data to add to db
      const songDetail = { title, artist, genre, duration };
      await Song.create(songDetail); // create
      //   await Song.insertMany(songsData);
      return res.status(200).json({
        status: true,
        message: 'Success add song',
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
  updateSong: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateKeyValue = req.body;
      if (!id) {
        return res.status(400).json({
          status: true,
          message: 'Insert ID of song',
        });
      }

      let updateData = await Song.findByIdAndUpdate(id, updateKeyValue, { new: true });
      if (!updateData) {
        return res.status(400).json({
          status: true,
          message: 'No data found to be updated',
        });
      }
      return res.status(200).json({
        status: true,
        message: 'Success update song',
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
  deleteSong: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          status: true,
          message: 'Insert ID of song',
        });
      }

      let deleteData = await Song.findByIdAndRemove(id);
      if (!deleteData) {
        return res.status(400).json({
          status: true,
          message: 'No data found to be deleted',
        });
      }
      return res.status(200).json({
        status: true,
        message: 'Success delete song',
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
