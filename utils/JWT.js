const jwt = require("jsonwebtoken");
const { token } = require("morgan");
const { promisify } = require("util");

exports.generateToken = async (payload) => {
  const token = await promisify(jwt.sign)(payload, process.env.SECRET, {
    expiresIn: 60 * 60,
  });

  return token;
};

exports.verify = async (access_token) => {
  const decoded = await promisify(jwt.verify)(access_token, process.env.SECRET);
  return decoded;
};
