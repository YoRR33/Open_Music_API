class AlbumsHandler {
  constructor(albumsService, storageService, albumsValidator, uploadValidator) {
    this._albumService = albumsService;
    this._storageService = storageService;
    this._albumValidator = albumsValidator;
    this._uploadValidator = uploadValidator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postAlbumCoverByIdHandler = this.postAlbumCoverByIdHandler.bind(this);
    this.postLikeAlbumByIdHandler = this.postLikeAlbumByIdHandler.bind(this);
    this.getLikeAlbumByIdHandler = this.getLikeAlbumByIdHandler.bind(this);
    this.deleteLikeAlbumByIdHandler =
      this.deleteLikeAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this._albumValidator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._albumService.addAlbum({ name, year });

    return h
      .response({
        status: "success",
        message: "Album berhasil ditambahkan",
        data: { albumId },
      })
      .code(201);
  }

  async getAlbumsHandler() {
    const albums = await this._albumService.getAlbums();
    return {
      status: "success",
      data: { albums },
    };
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._albumService.getAlbumById(id);
    return h.response({
      status: "success",
      data: { album },
    });
  }

  async putAlbumByIdHandler(request, h) {
    this._albumValidator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._albumService.editAlbumById(id, request.payload);

    return h
      .response({
        status: "success",
        message: "Album berhasil diperbarui",
      })
      .code(200);
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._albumService.deleteAlbumById(id);

    return h
      .response({
        status: "success",
        message: "Album berhasil dihapus",
      })
      .code(200);
  }

  async postAlbumCoverByIdHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    // Validasi cover
    this._uploadValidator.validateAlbumCoverPayload(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/albums/covers/${filename}`;

    await this._albumService.editAlbumToAddCoverById(id, fileLocation);

    return h
      .response({
        status: "success",
        message: "Sampul Album berhasil diunggah",
      })
      .code(201);
  }

  async postLikeAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._albumService.getAlbumById(id);
    await this._albumService.checkLikeAlbumById(id, credentialId);
    await this._albumService.addLikeAlbumById(id, credentialId);

    return h
      .response({
        status: "success",
        message: "Like berhasil ditambahkan",
      })
      .code(201);
  }

  async getLikeAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const { likes, source } = await this._albumService.getLikeAlbumById(id);

    const response = h.response({
      status: "success",
      data: {
        likes,
      },
    });
    response.header("X-Data-Source", source);
    return response;
  }

  async deleteLikeAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._albumService.getAlbumById(id);
    await this._albumService.deleteLikeAlbumById(id, credentialId);

    return h
      .response({
        status: "success",
        message: "Like berhasil dihapus",
      })
      .code(200);
  }
}

module.exports = AlbumsHandler;
