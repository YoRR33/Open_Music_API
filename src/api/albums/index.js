const AlbumsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "albums",
  version: "1.0.0",
  register: async (
    server,
    { albumsService, storageService, albumsValidator, uploadValidator }
  ) => {
    const albumsHandler = new AlbumsHandler(
      albumsService,
      storageService,
      albumsValidator,
      uploadValidator
    );
    server.route(routes(albumsHandler));
  },
};
