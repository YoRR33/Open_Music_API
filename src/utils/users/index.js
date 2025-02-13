const mapUsersToModel = ({
  id,
  username,
  password,
  fullname,
  created_at,
  updated_at,
}) => ({
  id,
  username,
  password,
  fullname,
  created_at,
  updated_at,
});
module.exports = { mapUsersToModel };
