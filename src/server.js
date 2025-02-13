require("dotenv").config();

const Hapi = require("@hapi/hapi");
const albums = require("./api/albums");
const songs = require("./api/songs");
const SongsService = require("./services/postgres/SongService");
const AlbumsService = require("./services/postgres/AlbumService");
const AlbumsValidator = require("./validator/albums");
const SongsValidator = require("./validator/songs");
const ClientError = require("./exceptions/ClientError");

const init = async () => {
  const songsService = new SongsService();
  const albumsService = new AlbumsService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register([
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    // {
    //   plugin: songs,
    //   options: {
    //     service: songsService,
    //     validator: SongsValidator,
    //   },
    // },
  ]);

  server.ext("onPreResponse", (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    // penanganan client error secara internal.
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }
    // mempertahankan penanganan client error oleh hapi secara native
    if (!response.isServer) {
      return h.continue;
    }

    // penanganan server error sesuai kebutuhan
    const newResponse = h.response({
      status: "error",
      message: "terjadi kegagalan pada server kami",
    });
    newResponse.code(500);
    console.error(response);
    return newResponse;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
