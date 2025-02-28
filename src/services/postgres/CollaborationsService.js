const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");

class CollaborationsService {
  constructor(usersService, cacheService) {
    this._pool = new Pool();
    this._usersService = usersService;
    this._cacheService = cacheService;
  }

  async addCollaboration(playlistId, userId) {
    await this._usersService.getUserById(userId);

    const id = nanoid(16);
    const query = {
      text: "INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id",
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Kolaborasi gagal ditambahkan");
    }
    await this._cacheService.delete(`notes:${userId}`);
    return result.rows[0].id;
  }

  async deleteCollaboration(playlistsId, userId) {
    const query = {
      text: "DELETE FROM collaborations WHERE playlists_id = $1 AND user_id = $2 RETURNING id",
      values: [playlistsId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Kolaborasi gagal dihapus");
    }
    await this._cacheService.delete(`notes:${userId}`);
  }

  async verifyCollaborator(playlistsId, userId) {
    const query = {
      text: "SELECT * FROM collaborations WHERE playlists_id = $1 AND user_id = $2",
      values: [playlistsId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Kolaborasi gagal diverifikasi");
    }
  }
}

module.exports = CollaborationsService;
