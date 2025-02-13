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
    pgm.createTable("collaborations", {
        id: {
          type: "VARCHAR(50)",
          primaryKey: true,
        },
        playlists_id: {
          type: "VARCHAR(50)",
          notNull: true,
          references: "playlists(id)",
          onDelete: "CASCADE",
        },
        user_id: {
          type: "VARCHAR(50)",
          notNull: true,
          references: "users(id)",
          onDelete: "CASCADE",
        },
      });
      pgm.addConstraint(
        "collaborations",
        "unique_playlists_id_and_user_id",
        "UNIQUE(playlists_id, user_id)"
      );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable("collaborations");
};
