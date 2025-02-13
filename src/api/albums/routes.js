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
];

module.exports = routes;
