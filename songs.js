const songs = [
  {
    title: 'Dont Stop Me Now',
    artist: 'Queen',
    genre: 'Rock',
    duration: 3.31,
  },
  {
    title: 'Slow Dancing In the Dark',
    artist: 'Joji',
    genre: 'Indie',
    duration: 3.29,
  },
  {
    title: 'The Real Slim Shady',
    artist: 'Eminem',
    genre: 'Rap',
    duration: 4.44,
  },
  {
    title: 'Sanctuary',
    artist: 'Joji',
    genre: 'Indie',
    duration: 3.04,
  },
  {
    title: 'Will He',
    artist: 'Joji',
    genre: 'Indie',
    duration: 3.22,
  },
  {
    title: 'Love Me Like Theres No Tomorrow',
    artist: 'Queen',
    genre: 'Rock',
    duration: 3.52,
  },
  {
    title: 'Forget Jakarta',
    artist: 'Aditya Sofyan',
    genre: 'Pop',
    duration: 6.44,
  },
  {
    title: 'Glimpse of Us',
    artist: 'Joji',
    genre: 'Indie',
    duration: 3.53,
  },
  {
    title: 'We Will Rock You',
    artist: 'Queen',
    genre: 'Rock',
    duration: 2.26,
  },
  {
    title: 'Adelaide Sky',
    artist: 'Aditya Sofyan',
    genre: 'Pop',
    duration: 4.54,
  },
  {
    title: 'Love of My Life',
    artist: 'Queen',
    genre: 'Rock',
    duration: 3.46,
  },
  {
    title: 'Radio Ga Ga',
    artist: 'Queen',
    genre: 'Rock',
    duration: 4.29,
  },
  {
    title: 'Mockingbird',
    artist: 'Eminem',
    genre: 'Rap',
    duration: 4.28,
  },
  {
    title: 'Without Me',
    artist: 'Eminem',
    genre: 'Rap',
    duration: 4.5,
  },
  {
    title: 'Lose Yourself',
    artist: 'Eminem',
    genre: 'Rap',
    duration: 5.22,
  },
  {
    title: 'Monster',
    artist: 'Eminem',
    genre: 'Rap',
    duration: 4.44,
  },
  {
    title: 'Sesuatu di Jogja',
    artist: 'Aditya Sofyan',
    genre: 'Pop',
    duration: 14.52,
  },
  {
    title: 'Blue Sky Collapse',
    artist: 'Aditya Sofyan',
    genre: 'Pop',
    duration: 4.51,
  },
];

// Use reduce to calculate the total duration
const totalDurationMinutes = songs.reduce((total, song) => {
  return total + song.duration;
}, 0);
const numberOfObject = Object.keys(songs).length;
// console.log(`There are ${numberOfObject} songs.`);

// Convert total duration to hours and minutes
// const totalHours = Math.floor(totalDurationMinutes / 60);
// const remainingMinutes = Math.floor(totalDurationMinutes % 60);

// console.log(`${totalDurationMinutes} minutesss`);

module.exports = songs;
