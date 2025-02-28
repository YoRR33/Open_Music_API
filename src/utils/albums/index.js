const mapAlbumsToModel = ({ id, name, year, songs, cover_url }) => ({
  id,
  name,
  year,
  songs,
  coverUrl: cover_url || null,
});
module.exports = { mapAlbumsToModel };
