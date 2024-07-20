const jwt = require("jsonwebtoken")
const ConfigFile = require("./../config")

module.exports.createToken = function(payload, options) {
    return jwt.sign(payload, ConfigFile.secret_key, {expiresIn: "2h"})
}