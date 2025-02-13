class PlaylistHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistHandler = this.getPlaylistHandler.bind(this);
    this.deletePlaylistHandler = this.deletePlaylistHandler.bind(this);
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getSongInPlaylistHandler = this.getSongInPlaylistHandler.bind(this);
    this.deleteSongFromPlaylistHandler =
      this.deleteSongFromPlaylistHandler.bind(this);
    this.getActivitiesHandler = this.getActivitiesHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistsPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist(name, credentialId);

    return h
      .response({
        status: "success",
        message: "Playlist berhasil ditambahkan",
        data: {
          playlistId,
        },
      })
      .code(201);
  }

  async getPlaylistHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    return h
      .response({
        status: "success",
        data: { playlists },
      })
      .code(200);
  }
  async deletePlaylistHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.deletePlaylistById(playlistId);

    return h.response({
      status: "success",
      message: "Playlist berhasil dihapus",
    });
  }
  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePlaylistsSongPayload(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    // console.log("playlistId:", playlistId);
    // console.log("songId:", songId);
    // console.log("credentialId:", credentialId);

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.addSongToPlaylist(playlistId, songId);

    // untuk menambah aktivitas "add" setiap menambah lagu
    await this._service.addSongActivity(
      playlistId,
      songId,
      credentialId,
      "add"
    );

    return h
      .response({
        status: "success",
        message: "Berhasil menambahkan lagu ke playlist",
      })
      .code(201);
  }

  async getSongInPlaylistHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._service.getPlaylistById(playlistId);
    const songs = await this._service.getSongsFromPlaylist(playlistId);

    return h
      .response({
        status: "success",
        data: {
          playlist: {
            ...playlist,
            songs,
          },
        },
      })
      .code(200);
  }
  async deleteSongFromPlaylistHandler(request, h) {
    this._validator.validatePlaylistsSongPayload(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deleteSongFromPlaylist(playlistId, songId);

    // untuk menambah aktivitas "delete" setiap menambah lagu
    await this._service.addSongActivity(
      playlistId,
      songId,
      credentialId,
      "delete"
    );

    return h.response({
      status: "success",
      message: "Lagu berhasil dihapus dari playlist",
    });
  }
  async getActivitiesHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    const activities = await this._service.getActivitiesByPlaylistId(
      playlistId
    );

    return h.response({
      status: "success",
      data: {
        playlistId,
        activities,
      },
    });
  }
}

module.exports = PlaylistHandler;
