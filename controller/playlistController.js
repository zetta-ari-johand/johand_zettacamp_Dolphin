const songs = require('../helpers/songs');
const writeJsonToFile = require('../helpers/writeFile');

// group by artist
async function songByArtists(songs) {
  try {
    const groupedSongs = {};
    const artistSet = new Set(); // store new empty set

    songs.forEach((song) => {
      const artist = song.artist; // store song.artis to new variable

      // check if the artist already exists in the groupedSongs object
      if (!groupedSongs[artist]) {
        // If not, create an object for the artist
        groupedSongs[artist] = {
          name: artist, // store the artist's name as a property
          songs: [], // create an array to store the artist's songs
        };
      }

      // add the song to the artist's songs array
      groupedSongs[artist].songs.push(song);
    });

    // sort artist from a - z
    const sortedGroupedSongs = {};
    const sortedArtistKeys = Object.keys(groupedSongs).sort();
    sortedArtistKeys.forEach((artist) => {
      sortedGroupedSongs[artist] = groupedSongs[artist].songs; // make new property based on the artist name that currently processed
      // then get array of the songs based on the artist name
    });
    artistSet.add(sortedArtistKeys);

    // let message = `You have ${sortedArtistKeys.length} favourite artist. They are: `;
    return { artistListSet: Array.from(artistSet), sortedGroupedSongs };
  } catch (error) {
    console.log(error);
  }
}

async function groupByGenres(songs) {
  try {
    const uniqueGenres = new Set(); // create a Set for unique genres
    const groupedSongs = {}; // initialize the grouped songs object

    songs.forEach((song) => {
      // add the genre to the uniqueGenres Set
      uniqueGenres.add(song.genre);

      // check the genre inside groupedSongs
      if (!groupedSongs[song.genre]) {
        groupedSongs[song.genre] = []; // if the genre doesn't exist, create an empty array
      }
      groupedSongs[song.genre].push(song); // push the song to the grouped songs of the genre
    });

    // convert uniqueGenres Set to an array and sort it
    const sortedGenres = Array.from(uniqueGenres).sort();

    // sort the groupedSongs object by genre keys
    const sortedGroupedSongs = {};
    sortedGenres.forEach((genre) => {
      sortedGroupedSongs[genre] = groupedSongs[genre];
    });

    // Return an object containing sorted genres and sorted grouped songs
    return { sortedGenres, sortedGroupedSongs };
  } catch (error) {
    console.error(error);
  }
}

// random song playlist < 1 hour
// async function randomPlaylistLessAnHour(songs) {
//   try {
//     const durationLimitMinutes = 60; // set the duration limit to 60 minutes
//     const randomSet = [...songs]; // copy the songs array to avoid modifying the original array
//     const randomSetLessThanHour = [];
//     let totalSeconds = 0;

//     while (totalSeconds < durationLimitMinutes * 60 && randomSet.length > 0) {
//       const randomIndex = Math.floor(Math.random() * randomSet.length);
//       const randomSong = randomSet[randomIndex];

//       // Parse the duration in "minute:second" format
//       const [minutes, seconds] = randomSong.duration.split(':').map(Number);
//       const songDurationInSeconds = minutes * 60 + seconds;

//       if (totalSeconds + songDurationInSeconds <= durationLimitMinutes * 60) {
//         randomSetLessThanHour.push(randomSong);
//         totalSeconds += songDurationInSeconds;
//       }

//       randomSet.splice(randomIndex, 1);
//     }

//     // Calculate total minutes and remaining seconds
//     const totalMinutes = Math.floor(totalSeconds / 60);
//     const remainingSeconds = totalSeconds % 60;

//     const message = `Total duration: ${totalMinutes} minutes and ${remainingSeconds} seconds with total songs played: ${randomSetLessThanHour.length}`;

//     //   console.log(`Total Duration: ${totalMinutes} minutes and ${remainingSeconds} seconds`);
//     //   console.log(`Total Songs Played: ${randomSetLessThanHour.length}`);

//     return { message, randomSetLessThanHour };
//   } catch (error) {}
// }

async function randomPlaylistLessAnHour(songs) {
  try {
    const durationLimitMinutes = 60; // set the duration limit to 60 minutes
    const randomSet = [...songs]; // copy the songs array to avoid modifying the original array
    const songList = [];
    let totalSeconds = 0;

    while (totalSeconds < durationLimitMinutes * 60 && randomSet.length > 0) {
      const randomIndex = Math.floor(Math.random() * randomSet.length);
      const randomSong = randomSet[randomIndex];

      // convert the duration in "minute:second" format
      const [minutes, seconds] = randomSong.duration.split(':').map(Number);
      const songDurationInSeconds = minutes * 60 + seconds;

      if (totalSeconds + songDurationInSeconds <= durationLimitMinutes * 60) {
        songList.push(randomSong);
        totalSeconds += songDurationInSeconds;
      }

      randomSet.splice(randomIndex, 1);
    }

    // calculate total minutes and remaining seconds
    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    const message = `Total duration: ${totalMinutes} minutes and ${remainingSeconds} seconds with total songs played: ${songList.length}`;

    // create a response map
    const responseMap = new Map();
    responseMap.set('random playlist less than 1 hour', {
      message,
      songList,
    });

    // convert the response map to an object
    const responseObject = Object.fromEntries(responseMap);

    return responseObject;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  byArtist: async (req, res, next) => {
    try {
      //   console.log(req.user);
      const groupedSongsByArtist = await songByArtists(songs);
      await writeJsonToFile(groupedSongsByArtist, 'result.json');
      return res.status(200).json({
        status: true,
        data: groupedSongsByArtist,
        // user: req.user,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        error: error,
      });
    }
  },

  byGenres: async (req, res, next) => {
    try {
      const groupedSongsByGenre = await groupByGenres(songs);
      await writeJsonToFile(groupedSongsByGenre, 'result.json');
      return res.status(200).json({
        status: true,
        data: groupedSongsByGenre,
        message: 'Success listing your playlist into file result.json',
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        error: error,
      });
    }
  },

  randomPlaylist: async (req, res, next) => {
    try {
      const randomPlaylist = await randomPlaylistLessAnHour(songs);
      await writeJsonToFile(randomPlaylist, 'result.json');
      return res.status(200).json({
        status: true,
        data: randomPlaylist,
        message: 'Success listing your playlist into file result.json',
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        error: error,
      });
    }
  },
};
