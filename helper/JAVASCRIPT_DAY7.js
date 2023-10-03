const songs = require('./songs');

// group by artist
function songByArtists(songs) {
  const groupedSongs = {};

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

  console.log(`You have ${sortedArtistKeys.length} favourite artist.\nThey are: ${sortedArtistKeys.join(', ')}`);
  return sortedGroupedSongs;
}

// group by genre
function groupByGenres(songs) {
  return songs.reduce((groupedSongs, song) => {
    // groupedSongs: accumulator, acumulate all song that has been grouped
    // song: proses lagu yang sedang di proses

    // check the genre inside groupedSongs
    if (!groupedSongs[song.genre]) {
      groupedSongs[song.genre] = []; // if the genre doesnt exist, it will make an empty array
    }
    groupedSongs[song.genre].push(song); // push song to grouped song genre
    return groupedSongs;
  }, {});
}

function randomPlaylistLessAnHour(songs) {
  const durationLimitMinutes = 60; // Set the duration limit to 60 minutes
  const randomSet = [...songs]; // Copy the songs array to avoid modifying the original array
  const randomSetLessThanHour = [];
  let totalSeconds = 0;

  while (totalSeconds < durationLimitMinutes * 60 && randomSet.length > 0) {
    const randomIndex = Math.floor(Math.random() * randomSet.length);
    const randomSong = randomSet[randomIndex];

    // Parse the duration in "minute:second" format
    const [minutes, seconds] = randomSong.duration.split(':').map(Number);
    const songDurationInSeconds = minutes * 60 + seconds;

    if (totalSeconds + songDurationInSeconds <= durationLimitMinutes * 60) {
      randomSetLessThanHour.push(randomSong);
      totalSeconds += songDurationInSeconds;
    }

    randomSet.splice(randomIndex, 1);
  }

  // Calculate total minutes and remaining seconds
  const totalMinutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  console.log(`Total Duration: ${totalMinutes} minutes and ${remainingSeconds} seconds`);
  console.log(`Total Songs Played: ${randomSetLessThanHour.length}`);

  return randomSetLessThanHour;
}

// const songsByArtists = songByArtists(songs);
// const songsByGenres = groupByGenres(songs);
// const songsWithDurationLessThan1Hour = randomPlaylistLessAnHour(songs);

// console.log(songsByArtists, 'BY ARTIST');
// console.log(songsByGenres, 'BY GENRE');
// console.log(songsWithDurationLessThan1Hour, 'RANDOMM');
