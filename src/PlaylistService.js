const { Pool } = require("pg");

class PlaylistService {
  constructor() {
    this._pool = new Pool();
  }

  // async getPlaylistSong(playlistId) {
  //   const playlistQuery = {
  //     text: "SELECT id, name FROM playlists WHERE id = $1",
  //     values: [playlistId],
  //   };

  //   const songQuery = {
  //     text: `SELECT songs.id, songs.title, songs.performer FROM playlists
  //           JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id
  //           JOIN songs ON songs.id = playlist_songs.song_id
  //           WHERE playlists.id = $1`,
  //     values: [playlistId],
  //   };

  //   const result = await this._pool.query(playlistQuery);
  //   const resultSongs = await this._pool.query(songQuery);

  //   const playlist = result.rows[0];
  //   const exportResult = {
  //     playlist: {
  //       id: playlist.id,
  //       name: playlist.name,
  //       songs: resultSongs.rows,
  //     },
  //   };

  //   return exportResult;
  // }

  async getPlaylistById(playlistId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username 
        FROM playlists
        INNER JOIN users ON users.id = playlists.owner
        WHERE playlists.id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new Error("Playlist tidak ditemukan");
    }
    return result.rows[0];
  }

  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs
        LEFT JOIN playlist_songs ON songs.id = playlist_songs.song_id
        WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}
module.exports = PlaylistService;
