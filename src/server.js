require("dotenv").config();

const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const path = require("path");
const Inert = require("@hapi/inert");

// songs
const songs = require("./api/songs");
const SongsService = require("./services/postgres/SongService");
const SongsValidator = require("./validator/songs");

// albums
const albums = require("./api/albums");
const AlbumsService = require("./services/postgres/AlbumService");
const AlbumsValidator = require("./validator/albums");

// playlist
const playlists = require("./api/playlists");
const PlaylistsService = require("./services/postgres/PlaylistsService");
const PlaylistsValidator = require("./validator/playlists");

// users
const users = require("./api/users");
const UsersService = require("./services/postgres/UsersService");
const UsersValidator = require("./validator/users");

// authentications
const authentications = require("./api/authentications");
const AuthenticationsService = require("./services/postgres/AuthenticationsService");
const TokenManager = require("./tokenize/TokenManager");
const AuthenticationsValidator = require("./validator/authentications");

// collaborations
const collaborations = require("./api/collaborations");
const CollaborationsService = require("./services/postgres/CollaborationsService");
const CollaborationsValidator = require("./validator/collaborations");

// export
const _exports = require("./api/exports");
const ProducerService = require("./services/rabitmq/ProducerService");
const ExportsValidator = require("./validator/exports");

// storage
const StorageService = require("./services/storage/StorageService");
const UploadValidator = require("./validator/uploads");

// cache
const CacheService = require("./services/redis/CacheService");

// error
const ClientError = require("./exceptions/ClientError");

const init = async () => {
  const cacheService = new CacheService();
  const authenticationsService = new AuthenticationsService();
  const songsService = new SongsService();
  const albumsService = new AlbumsService(cacheService);
  const usersService = new UsersService();
  const collaborationsService = new CollaborationsService(
    usersService,
    cacheService
  );
  const playlistsService = new PlaylistsService(
    collaborationsService,
    songsService
  );
  const storageService = new StorageService(
    path.resolve(__dirname, "api/albums/file/covers")
  );

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy("openmusic_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
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
        albumsService,
        storageService,
        albumsValidator: AlbumsValidator,
        uploadValidator: UploadValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        ProducerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
    // {
    //   plugin: _exports,
    //   options: {
    //     service: ProducerService,
    //     validator: ExportsValidator,
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
