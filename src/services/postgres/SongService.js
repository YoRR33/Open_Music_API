const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const { mapSongsToModel } = require("../../utils/songs");
const NotFoundError = require("../../exceptions/NotFoundError");

class SongsService {
  constructor() {
    this._pool = new Pool();
  }
  async addSong({ albumId, title, genre, year, performer, duration }) {
    const id = `song-${nanoid(16)}`;

    // Query SQL yang benar
    const query = {
      text: `
        INSERT INTO songs (id, "albumId", title, genre, year, performer, duration) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id
      `,
      values: [id, albumId, title, genre, year, performer, duration],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan");
    }

    return result.rows[0].id;
  }
  async getSongs({ title, performer }) {
    const conditions = [];
    const params = [];

    // Tambahkan kondisi ke array jika parameter diberikan
    if (title) {
      params.push(`%${title}%`);
      conditions.push(`title ILIKE $${params.length}`);
    }

    if (performer) {
      params.push(`%${performer}%`);
      conditions.push(`performer ILIKE $${params.length}`);
    }

    // Bangun query akhir
    const query = `
      SELECT id, title, performer
      FROM songs
      ${conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""}
    `;

    const result = await this._pool.query(query, params);
    return result.rows;
  }
  // async getSongs({ title, performer }) {
  //   // Buat query dasar
  //   let query = "SELECT id, title, performer FROM songs WHERE 1=1";
  //   const params = [];

  //   // Tambahkan kondisi untuk `title` jika ada
  //   if (title) {
  //     params.push(`%${title}%`); // Menggunakan LIKE dengan wildcard
  //     query += ` AND title ILIKE $${params.length}`; // Gunakan ILIKE untuk pencarian case-insensitive
  //   }

  //   // Tambahkan kondisi untuk `performer` jika ada
  //   if (performer) {
  //     params.push(`%${performer}%`); // Menggunakan LIKE dengan wildcard
  //     query += ` AND performer ILIKE $${params.length}`;
  //   }

  //   const result = await this._pool.query(query, params);
  //   return result.rows; // Kembalikan hasil
  // }
  // async getSongs() {
  //   const result = await this._pool.query(
  //     "SELECT id, title, performer FROM songs"
  //   );
  //   return result.rows;
  //   // return result.rows.map(mapSongsToModel);
  // }
  async getSongById(id) {
    const query = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);
    // console.log(result);

    if (!result.rows.length) {
      throw new NotFoundError("Lagu tidak ditemukan");
    }
    return result.rows.map(mapSongsToModel)[0];
  }
  async editSongById(
    id,
    { albumId = null, title, year, genre, performer, duration }
  ) {
    const query = {
      text: `UPDATE songs SET "albumId" = $1, title = $2, genre = $3, year = $4, performer = $5, duration = $6 WHERE id = $7 RETURNING id`,
      values: [albumId, title, genre, year, performer, duration, id],
    };
    // console.log(query);
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui lagu. Id tidak ditemukan");
    }
  }
  async deleteSongById(id) {
    const query = {
      text: "DELETE FROM songs WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Lagu gagal dihapus. Id tidak ditemukan");
    }
  }
}

module.exports = SongsService;
