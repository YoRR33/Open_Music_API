const Jwt = require("@hapi/jwt");
const InvariantError = require("../exceptions/InvariantError");

const TokenManager = {
  generateAccessToken: (payload) =>
    Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),
  generateRefreshToken: (payload) =>
    Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
      const { payload } = artifacts.decoded;
      return payload;
    } catch {
      throw new InvariantError("Refresh token tidak valid");
    }
  },
};

module.exports = TokenManager;

/*
Membuat token secara random (ketikan di terminal node)
Lakukan 2x yaitu untuk ACCESS_TOKEN_KEY dan REFRESH_TOKEN_KEY
yang berada di .env


require("crypto").randomBytes(64).toString("hex");
*/
