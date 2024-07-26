const PostService = require('../services/PostService')
const LoggerHttp = require ('../utils/logger').http
const passport = require('passport')

// La fonction permet d'ajouter un post
module.exports.addOnePost = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Création d'un post")
    PostService.addOnePost(req.body, null, function(err, value) {
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

// La fonction permet d'ajouter plusieurs posts
module.exports.addManyPosts = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Création de plusieurs posts")
    let options = {user: req.user}
    PostService.addManyPosts(req.body, options, function(err, value) {
        console.log(err, value)
        if (err) {
            res.statusCode = 405
            res.send(err)
        }else {
            res.statusCode = 201
            res.send(value)
        }
    })
}

// La fonction permet de chercher un post
module.exports.findOnePostById = function(req, res) {
    req.log.info("Recherche d'un post par son id")
    let opts = {populate: req.query.populate}

    PostService.findOnePostById(req.params.id, opts, function(err, value) {        
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

// La fonction permet de chercher plusieurs posts
module.exports.findManyPostsById = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Recherche de plusieurs posts", req.query.id)
    let arg = req.query.id
    let opts = {populate: req.query.populate}
    if (arg && !Array.isArray(arg))
        arg=[arg]

    PostService.findManyPostsById(arg, opts, function(err, value) {
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

// La fonction permet de chercher un post par les champs autorisé
module.exports.findOnePost = function(req, res){
    LoggerHttp(req, res)
    req.log.info("Recherche d'un post par un champ autorisé")
    let fields = req.query.fields
    let opts = {populate: req.query.populate}
    if (fields && !Array.isArray(fields))
        fields = [fields]

    PostService.findOnePost(fields, req.query.value, opts, function(err, value) {        
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

// La fonction permet de chercher plusieurs utilisateurs
module.exports.findManyPosts = function(req, res) {
    req.log.info("Recherche de plusieurs posts")
    let page = req.query.page
    let pageSize = req.query.pageSize
    let searchValue = req.query.q
    let opts = {populate: req.query.populate}

    PostService.findManyPosts(searchValue, pageSize, page,  opts, function(err, value) {        
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

// La fonction permet de modifier un post
module.exports.updateOnePost = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Modification d'un post")
    let update = req.body
    let options = {user: req.user}

    PostService.updateOnePost(req.params.id, update, options, function(err, value) {
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

// La fonction permet de modifier plusieurs posts
module.exports.updateManyPosts = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Modification de plusieurs posts")
    var arg = req.query.id
    let options = {user: req.user}
    if (arg && !Array.isArray(arg))
        arg = [arg]
    var updateData = req.body
    
    PostService.updateManyPosts(arg, updateData, options, function(err, value) {
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

// La fonction permet de supprimer un post
module.exports.deleteOnePost = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Suppression d'un post")
    PostService.deleteOnePost(req.params.id, null, function(err, value) {        
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

// La fonction permet de supprimer plusieurs posts
module.exports.deleteManyPosts = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Suppression de plusieurs posts")
    var arg = req.query.id
    if (arg && !Array.isArray(arg))
        arg = [arg]
    PostService.deleteManyPosts(arg, null, function(err, value) {
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