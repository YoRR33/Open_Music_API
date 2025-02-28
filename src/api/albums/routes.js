const path = require("path");

const routes = (handler) => [
  {
    method: "POST",
    path: "/albums",
    handler: handler.postAlbumHandler, // postNoteHandler hanya menerima dan menyimpan "satu" note.
  },
  {
    method: "GET",
    path: "/albums",
    handler: handler.getAlbumsHandler, //getNotesHandler mengembalikan "banyak" note.
  },
  {
    method: "GET",
    path: "/albums/{id}",
    handler: handler.getAlbumByIdHandler,
  },
  {
    method: "PUT",
    path: "/albums/{id}",
    handler: handler.putAlbumByIdHandler,
  },
  {
    method: "DELETE",
    path: "/albums/{id}",
    handler: handler.deleteAlbumByIdHandler,
  },
  {
    method: "POST",
    path: "/albums/{id}/covers",
    handler: handler.postAlbumCoverByIdHandler,
    options: {
      payload: {
        allow: "multipart/form-data",
        multipart: true,
        output: "stream",
        maxBytes: 512000,
      },
    },
  },
  {
    method: "GET",
    path: "/albums/cover/{param*}",
    handler: {
      directory: {
        path: path.resolve(__dirname, "file"),
      },
    },
  },
  {
    method: "POST",
    path: "/albums/{id}/likes",
    handler: handler.postLikeAlbumByIdHandler,
    options: {
      auth: "openmusic_jwt",
    },
  },
  {
    method: "GET",
    path: "/albums/{id}/likes",
    handler: handler.getLikeAlbumByIdHandler,
  },
  {
    method: "DELETE",
    path: "/albums/{id}/likes",
    handler: handler.deleteLikeAlbumByIdHandler,
    options: {
      auth: "openmusic_jwt",
    },
  },
];

module.exports = routes;
