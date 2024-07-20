const UserService = require('../services/UserService')
const LoggerHttp = require('../utils/logger').http

// ajout d'un utilisateur
module.exports.addOneUser = function (req,res){
    UserService.addOneUser(req.body, function(err, value) {
        // console.log('mon erreur est :', err)

        if(err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }else if(err && err.type_error == "validator") {
            res.statusCode = 405
            res.send(err)
        }else if(err && err.type_error == "duplicate") {
            res.statusCode = 405
            res.send(err);
        }else {
            res.statusCode = 201 //création réussit
            res.send(value)
        }
    })
}

// La fonction permet d'ajouter plusieurs utilisateurs
module.exports.addManyUsers = function(req, res) {
    req.log.info("Création de plusieurs utilisateurs")

    UserService.addManyUsers(req.body, function(err, value) {
        if (err) {
            res.statusCode = 405
            res.send(err)
        }else {
            res.statusCode = 201
            res.send(value)
        }
    })
}

// La fonction permet de supprimer un utilisateur
module.exports.deleteOneUser = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Suppression d'un utilisateur")
    
    UserService.deleteOneUser(req.params.id, function(err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
            res.send(err)
        }else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

// La fonction permet de supprimer plusieurs utilisateurs
module.exports.deleteManyUsers = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Suppression de plusieurs utilisateur")

    let arg = req.query.id

    if (arg && !Array.isArray(arg)){
        arg = [arg]
    }

    UserService.deleteManyUsers(arg, function(err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
        }else {
            res.statusCode = 200
            res.send(value)
        }
    })
}