import Song from '../classes/Song.js';
import domUtils from '../domUtils.js';

const songs = [
  {
    id: 'zeldas-lullaby',
    name: 'Zelda\'s Lullaby'
  },
  {
    id: 'epona',
    name: 'Epona\'s Song'
  },
  {
    id: 'saria',
    name: 'Saria\'s Song'
  },
  {
    id: 'suns-song',
    name: 'Sun\'s Song'
  },
  {
    id: 'ocarina',
    name: 'Song of Time'
  },
  {
    id: 'song-of-storms',
    name: 'Song of Storms'
  },
  {
    id: 'minuet',
    name: 'Minuet of Forest'
  },
  {
    id: 'bolero',
    name: 'Bolero of Fire'
  },
  {
    id: 'serenade',
    name: 'Serenade of Water'
  },
  {
    id: 'nocturne',
    name: 'Nocturne of Shadows'
  },
  {
    id: 'requiem',
    name: 'Requiem of Spirits'
  },
  {
    id: 'prelude',
    name: 'Prelude of Light'
  },
];

export function addSongs() {
  const songsContainer = domUtils.el('#songs');
  songs.forEach((songData) => {
    const song = new Song(songData.id, songData.name);
    song.appendTo(songsContainer);
  });
}
