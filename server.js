const express = require('express')
const _ = require('lodash')
const bodyParser = require('body-parser')
const Config = require('./config')
const Logger = require('./utils/logger').pino

// création de l'appli express
const app = express()

//démmarrage de la database
require('./utils/database');

// déclaration des controller pour utilisateur
const UserController = require('./controllers/UserController')

// Déclaration des middlewares
const DatabaseMiddleware = require('./middlewares/database')
const LoggerMiddleware = require('./middlewares/logger')

//déclaration des middlewareà express
app.use(bodyParser.json(), LoggerMiddleware.addLogger)

// création des routes
// Création du endpoint /user pour l'ajout d'un utilisateur
app.post('/user', DatabaseMiddleware.checkConnexion, UserController.addOneUser)

// Création du endpoint /users pour l'ajout de plusieurs utilisateurs
app.post('/users', DatabaseMiddleware.checkConnexion, UserController.addManyUsers)

// Création du endpoint /user pour delete un utilisateur
app.delete('/user/:id', DatabaseMiddleware.checkConnexion, UserController.deleteOneUser)

// Création du endpoint /user pour delete un utilisateur
app.delete('/users', DatabaseMiddleware.checkConnexion, UserController.deleteManyUsers)

// démarrage du serveur au port définit
app.listen(Config.port, () => {
    Logger.info(`(INFO) ${(new Date()).toLocaleString()}: Le serveur a démarré`)
})

module.exports = app