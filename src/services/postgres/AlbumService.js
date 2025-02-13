const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const { mapAlbumsToModel } = require("../../utils/albums");
const NotFoundError = require("../../exceptions/NotFoundError");
const ClientError = require("../../exceptions/ClientError");

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }
  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO albums(id, name, year) VALUES($1, $2, $3) RETURNING id",
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Albums gagal ditambahkan");
    }

    return result.rows[0].id;
  }
  async getAlbums() {
    const result = await this._pool.query("SELECT * FROM albums");
    return result.rows.map(mapAlbumsToModel);
  }
  async getAlbumById(id) {
    // Query untuk mengambil data album
    const albumQuery = {
      text: "SELECT id, name, year FROM albums WHERE id = $1",
      values: [id],
    };
    const albumResult = await this._pool.query(albumQuery);

    // Jika album tidak ditemukan, lemparkan error
    if (!albumResult.rows.length) {
      throw new NotFoundError("Album tidak ditemukan");
    }

    // Query untuk mengambil data lagu berdasarkan albumId
    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
      values: [id],
    };
    const songsResult = await this._pool.query(songsQuery);

    // Gabungkan hasil album dan daftar lagunya
    const album = albumResult.rows[0]; // Ambil data album
    album.songs = songsResult.rows; // Tambahkan properti "songs" dengan hasil query lagu

    return album;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id",
      values: [name, year, id],
    };
    if (!name || !year) {
      throw new ClientError("Nama dan tahun album harus diisi.");
    }
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui albums. Id tidak ditemukan");
    }
  }
  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Albums gagal dihapus. Id tidak ditemukan");
    }
  }
}

module.exports = AlbumsService;
