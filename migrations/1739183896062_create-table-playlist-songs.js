/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("playlist_songs", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    playlist_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "playlists(id)",
      onDelete: "CASCADE",
    },
    song_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "songs(id)",
      onDelete: "CASCADE",
    },
  });

  pgm.addConstraint("playlist_songs", "unique_playlist_song", {
    unique: ["playlist_id", "song_id"],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("playlist_songs");
};
