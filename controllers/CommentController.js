const CommentService = require('../services/CommentService')
const LoggerHttp = require ('../utils/logger').http
const passport = require('passport')

// La fonction permet d'ajouter un comment
module.exports.addOneComment = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Création d'un comment")
    CommentService.addOneComment(req.body, null, function(err, value) {
        if (err && err.type_error == "no found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "validator") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "duplicate") {
            res.statusCode = 405
            res.send(err)   
        }
        else {
            res.statusCode = 201
            res.send(value)
        }
    })
}

// La fonction permet d'ajouter plusieurs comments
module.exports.addManyComments = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Création de plusieurs comments")
    let options = {user: req.user}
    CommentService.addManyComments(req.body, options, function(err, value) {
        if (err) {
            res.statusCode = 405
            res.send(err)
        }else {
            res.statusCode = 201
            res.send(value)
        }
    })
}

// La fonction permet de chercher un comment
module.exports.findOneCommentById = function(req, res) {
    req.log.info("Recherche d'un comment par son id")
    let opts = {populate: req.query.populate}

    CommentService.findOneCommentById(req.params.id, opts, function(err, value) {        
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
            res.send(err)
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

// La fonction permet de chercher plusieurs commentaires
module.exports.findManyCommentsById = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Recherche de plusieurs commentaires", req.query.id)
    let arg = req.query.id
    let opts = {populate: req.query.populate}
    if (arg && !Array.isArray(arg))
        arg=[arg]

    CommentService.findManyCommentsById(arg, opts, function(err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
            res.send(err)
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

// La fonction permet de chercher un commentaire par les champs autorisé
module.exports.findOneComment = function(req, res){
    LoggerHttp(req, res)
    req.log.info("Recherche d'un commentaire par un champ autorisé")
    let fields = req.query.fields
    let opts = {populate: req.query.populate}
    if (fields && !Array.isArray(fields))
        fields = [fields]

    CommentService.findOneComment(fields, req.query.value, opts, function(err, value) {        
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
            res.send(err)
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

// La fonction permet de chercher plusieurs commentaires
module.exports.findManyComments = function(req, res) {
    req.log.info("Recherche de plusieurs commentaires")
    let page = req.query.page
    let pageSize = req.query.pageSize
    let field = req.query.field
    let searchValue = req.query.q
    let opts = {populate: req.query.populate}

    CommentService.findManyComments(searchValue, field, pageSize, page,  opts, function(err, value) {        
        if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
            res.send(err)
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

// La fonction permet de modifier un comentaire
module.exports.updateOneComment = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Modification d'un commentaire")
    let update = req.body
    let options = {user: req.user}

    CommentService.updateOneComment(req.params.id, update, options, function(err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && (err.type_error == "no-valid" || err.type_error == "validator" || err.type_error == "duplicate" ) ) {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

// La fonction permet de modifier plusieurs commentaires
module.exports.updateManyComments = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Modification de plusieurs commentaires")
    var arg = req.query.id
    let options = {user: req.user}
    if (arg && !Array.isArray(arg))
        arg = [arg]
    var updateData = req.body
    
    CommentService.updateManyComments(arg, updateData, options, function(err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && (err.type_error == "no-valid" || err.type_error == "validator" || err.type_error == 'duplicate')) {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

// La fonction permet de supprimer un commentaire
module.exports.deleteOneComment = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Suppression d'un commentaire")
    CommentService.deleteOneComment(req.params.id, null, function(err, value) {        
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
            res.send(err)
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

// La fonction permet de supprimer plusieurs commentaires
module.exports.deleteManyComments = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Suppression de plusieurs commentaires")
    var arg = req.query.id
    if (arg && !Array.isArray(arg))
        arg = [arg]
    CommentService.deleteManyComments(arg, null, function(err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}