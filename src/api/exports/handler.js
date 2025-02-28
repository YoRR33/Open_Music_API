class ExportsHandler {
  constructor(ProducerService, playlistsService, validator) {
    this._service = ProducerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    // binding function
    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
  }
  //   funcction kirim export playlist
  async postExportPlaylistHandler(request, h) {
    //  validasi isi payload
    this._validator.validateExportPlaylistPayload(request.payload);

    const { playlistId } = request.params;

    const { id: credentialId } = request.auth.credentials;

    //   verifikasi playlist owner
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    //   ambil target email dan userId dari payload
    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    //  kirim pesan dengan service sendMessage
    await this._service.sendMessage(
      "export:playlists",
      JSON.stringify(message)
    );

    return h
      .response({
        status: "success",
        message: "Permintaan Anda sedang kami proses",
      })
      .code(201);
  }
}
module.exports = ExportsHandler;
