const FeedService = require('../services/FeedService')
const LoggerHttp = require ('../utils/logger').http
const passport = require('passport')

module.exports.getUserConnectedFeed = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Récupération du feed de l'utilisateur connecté")
    let opts = {populate: req.query.populate}

    FeedService.getUserConnectedFeed(req.params.id, opts, function(err, value) {
        if (err && err.type_error == "no found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "validator") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "duplicate") {
            res.statusCode = 405
            res.send(err)   
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}