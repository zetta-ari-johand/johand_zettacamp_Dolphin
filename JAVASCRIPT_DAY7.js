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

// random song playlist < 1 hour
function randomPlaylistLessAnHour(songs) {
  const groupedSongs = {
    randomPlaylist: [], // For songs with random artists and genres
  };
  let totalDuration = 0;
  let totalSeconds = 0;

  while (totalDuration < 60 && songs.length > 0) {
    const randomIndex = Math.floor(Math.random() * songs.length);
    const randomSong = songs[randomIndex];

    if (totalDuration + randomSong.duration <= 60) {
      groupedSongs.randomPlaylist.push(randomSong);
      totalDuration += Math.floor(randomSong.duration);
      totalSeconds += Math.round((randomSong.duration % 1) * 60); // convert seconds to a fraction of a minute
      if (totalSeconds >= 60) {
        totalDuration += 1; // Add 1 minute
        totalSeconds -= 60; // Subtract 60 seconds
      }
    } else {
      break;
    }

    songs.splice(randomIndex, 1);
  }

  const numberOfSongs = groupedSongs.randomPlaylist.length;

  console.log(`Total Duration is: ${totalDuration} minutes and ${totalSeconds} seconds, and total songs is: ${numberOfSongs}`);
  return groupedSongs;
}

const songsByArtists = songByArtists(songs);
const songsByGenres = groupByGenres(songs);
const songsWithDurationLessThan1Hour = randomPlaylistLessAnHour(songs);

console.log(songsByArtists, 'BY ARTIST');
console.log(songsByGenres, 'BY GENRE');
console.log(songsWithDurationLessThan1Hour, 'RANDOMM');
