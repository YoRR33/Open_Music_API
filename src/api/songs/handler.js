class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { albumId, title, year, genre, performer, duration } =
      request.payload;

    const songId = await this._service.addSong({
      albumId,
      title,
      genre,
      year,
      performer,
      duration,
    });

    const response = h.response({
      status: "success",
      message: "Lagu berhasil ditambahkan",
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  // async getSongsHandler(request, h) {
  //   const { title, performer } = request.query;

  //   try {
  //     const songs = await this._service.getSongs({ title, performer });
  //     h.json(songs);
  //   } catch (error) {
  //     console.error(error);
  //     h.status(500).json({ message: "Internal server error" });
  //   }
  // }
  async getSongsHandler(request, h) {
    const { title = "", performer = "" } = request.query; // Mengambil query parameter.

    const songs = await this._service.getSongs({ title, performer }); // Memanggil layanan pencarian.
    // const songs = await this._service.getSongs();
    return h.response({
      status: "success",
      data: {
        songs,
      },
    });
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    const response = h.response({
      status: "success",
      data: {
        song,
      },
    });
    response.code(200);
    return response;
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;

    await this._service.editSongById(id, request.payload);

    const response = h.response({
      status: "success",
      message: "Lagu berhasil diperbarui",
    });
    response.code(200);
    return response;
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteSongById(id);

    const response = h.response({
      status: "success",
      message: "Catatan berhasil dihapus",
    });
    response.code(200);
    return response;
  }
}

module.exports = SongsHandler;
