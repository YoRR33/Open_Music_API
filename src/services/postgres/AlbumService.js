const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const { mapAlbumsToModel } = require("../../utils/albums");
const NotFoundError = require("../../exceptions/NotFoundError");
const ClientError = require("../../exceptions/ClientError");

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
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
      text: "SELECT id, name, year, cover_url FROM albums WHERE id = $1",
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

    // Gunakan mapAlbumsToModel untuk memetakan data album
    return mapAlbumsToModel(album);
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

  async editAlbumToAddCoverById(id, coverUrl) {
    const query = {
      text: "UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id",
      values: [coverUrl, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError(
        "Gagal menambahkan cover album. Id album tidak ditemukan"
      );
    }

    return result.rows[0]; // Langsung return objek album yang diperbarui
  }

  async addLikeAlbumById(albumId, userId) {
    const id = `like-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO likes(id, album_id, user_id) VALUES($1, $2, $3) RETURNING id",
      values: [id, albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Like gagal ditambahkan");
    }
    // hapus cache
    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getLikeAlbumById(albumId) {
    try {
      const cachedLikes = await this._cacheService.get(`likes:${albumId}`);
      if (cachedLikes !== null) {
        return { likes: Number(cachedLikes), source: "cache" };
      }
    } catch {
      // Jika terjadi error saat mengambil cache, ambil dari database
      const result = await this._pool.query(
        "SELECT COUNT(*) FROM likes WHERE album_id = $1",
        [albumId]
      );

      // hitung jumlah like
      const likeCount = Number(result.rows[0].count || 0);

      // set cache like
      await this._cacheService.set(`likes:${albumId}`, likeCount);

      // Kembalikan jumlah like dengan sumbernya (dari database)
      return { likes: likeCount, source: "database" };
    }
  }

  async deleteLikeAlbumById(albumId, userId) {
    const query = {
      text: "DELETE FROM likes WHERE album_id = $1 AND user_id = $2 RETURNING id",
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Like gagal dihapus. Id tidak ditemukan");
    }
    // hapus cache
    await this._cacheService.delete(`likes:${albumId}`);
  }

  async checkLikeAlbumById(albumId, userId) {
    const query = {
      text: "SELECT * FROM likes WHERE album_id = $1 AND user_id = $2",
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      return false;
    } else {
      throw new InvariantError("Like sudah ada");
    }
  }
}

module.exports = AlbumsService;
