const UserService = require('../services/UserService')
const LoggerHttp = require ('../utils/logger').http
const passport = require('passport')
const TokenUtils = require('./../utils/token')

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     description: Login user with the provided details.
 *     tags: 
 *       - Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Login successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       405:
 *          $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Internal server error.
 */
// la fonction pour gerer l'authentification depuis passport
// module.exports.loginUser = function(req, res, next) {
//     console.log('ok')
//     if (req.body.username === '' || req.body.password === '') {
//         res.statusCode = 405;
//         return res.send({ msg: "Tous les champs doivent être remplis", type_error: "no-valid-login" });
//     } else {
//         console.log('ok1')
//         passport.authenticate('login', { badRequestMessage: "Les champs sont manquants." }, async function(err, user) {
//             if (err) {
//                 console.log('Erreur lors de l\'authentification:', err);
//                 res.statusCode = 401;
//                 return res.send({ msg: "Le nom d'utilisateur ou le mot de passe n'est pas correct", type_error: "no-valid-login" });
//             }
//             req.logIn(user, async function (err) {
//                 console.log('ok2')
//                 if (err) {
//                     console.log('Erreur lors de la connexion de l\'utilisateur:', err);
//                     res.statusCode = 500;
//                     return res.send({ msg: "Problème d'authentification sur le serveur.", type_error: "internal" });
//                 } else {
//                     console.log('ok3')
//                     console.log(value)
//                     var token = TokenUtils.createToken({ _id: value._id }, null)
//                     console.log(token)
//                     console.log('ok4')
//                     res.cookie('authToken', token, {
//                         httpOnly: true,
//                         secure: process.env.NODE_ENV === 'production', // Utiliser secure seulement en production
//                         sameSite: 'Strict'
//                     });
//                     console.log('ok5')
//                     return res.status(200).send({ user, token });
//                 }
//             });
//         })(req, res, next);
//     }
// };
module.exports.loginUser = function(req, res, next) {
    // console.log(req.body)
    if(req.body.username == '' || req.body.password == ''){
        res.statusCode = 405
        return res.send({msg: "Tous les champs doivent étre remplis", type_error: "no-valid-login"})
    }else{
        passport.authenticate('login', { badRequestMessage: "Les champs sont manquants."}, async function(err, user) {
            if(err){
                res.statusCode = 401
                return res.send({msg: "Le nom d'utilisateur ou le mot de passe n'est pas correct", type_error: "no-valid-login"})
            }
            req.logIn(user, async function (err) {
                if(err) {
                    res.statusCode = 500
                    return res.send({msg: "Probleme d'authentification sur le serveur.", type_error: "internal"})
                }else{
                    return res.send(user)
                }
            })
        })(req, res, next)
    }
}

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout user
 *     description: Logout user with the provided id.
 *     tags: 
 *       - Logout
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Logout'
 *     responses:
 *       200:
 *         description: Logout successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: "John"
 *                     email:
 *                       type: string
 *                       example: "John@gmail.com"
 *                     password:
 *                       type: string
 *                       example: "johnsecuredpassword1234"
 *                     status:
 *                       type: string
 *                       example: "joueur"
 *                     bio:
 *                       type: string
 *                       example: "Je suis un joueur de foot"
 *                     profil_image:
 *                       type: string
 *                       example: ""
 *                     banner_image:
 *                       type: string
 *                       example: ""
 *                     follows:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["6696711304c71eaa5de75189", "6696711304c71eaa5de75187"]
 *                     created_by:
 *                       type: string
 *                       example: "6696711304c71eaa5de75189"
 *                     created_at:
 *                       type: string
 *                       example: "Mon Jul 29 2024 15:15:13 GMT+0200 (heure d’été d’Europe centrale)"
 *                     updated_at:
 *                       type: string
 *                       example: "Mon Jul 30 2024 17:8:10 GMT+0200 (heure d’été d’Europe centrale)"
 *                     token:
 *                       type: string
 *                       example: ""
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       405:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Internal server error.
 */
// la fonction pour gerer la déconnexion depuis passport
module.exports.logoutUser = function(req, res, next) {
    req.log.info("Déconnexion d'un utilisateur")
    UserService.logoutUser(req.params.id, null, function(err, value) {        
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

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user with the provided details.
 *     tags: 
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       405:
 *          $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Internal server error.
 */
// La fonction permet d'ajouter un utilisateur
module.exports.addOneUser = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Création d'un utilisateur")
    UserService.addOneUser(req.body, null, function(err, value) {
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

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Add multiple users
 *     description: Create multiple users with the provided details.
 *     tags: 
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Users created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       405:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Internal server error.
 */
// La fonction permet d'ajouter plusieurs utilisateurs
module.exports.addManyUsers = function(req, res) {
    req.log.info("Création de plusieurs utilisateurs")
    UserService.addManyUsers(req.body, null, function(err, value) {
        if (err) {
            res.statusCode = 405
            res.send(err)
        }else {
            res.statusCode = 201
            res.send(value)
        }
    })
}

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a user by their ID.
 *     tags: 
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A user object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       405:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Internal server error.
 */
// La fonction permet de chercher un utilisateur
module.exports.findOneUserById = function(req, res) {
    req.log.info("Recherche d'un utilisateur par son id")
    UserService.findOneUserById(req.params.id, null, function(err, value) {        
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

/**
 * @swagger
 * /find_user:
 *   get:
 *     summary: Find a user by specified fields
 *     description: Retrieve a user based on the specified fields and values.
 *     tags: 
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: fields
 *         in: query
 *         description: List of fields to search on. Can be a comma-separated string or an array of strings.
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["username", "email"]
 *       - name: value
 *         in: query
 *         description: Value to search for in the specified fields.
 *         required: true
 *         schema:
 *           type: string
 *           example: "john_doe"
 *     responses:
 *       200:
 *         description: User found successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "User not found."
 *                 type_error:
 *                   type: string
 *                   example: "no-found"
 *       405:
 *         description: Validation error or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Invalid input."
 *                 type_error:
 *                   type: string
 *                   example: "no-valid"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Internal server error."
 *                 type_error:
 *                   type: string
 *                   example: "error-mongo"
 */
// La fonction permet de chercher un utilisateur par les champs autorisé
module.exports.findOneUser = function(req, res){
    LoggerHttp(req, res)
    req.log.info("Recherche d'un utilisateur par un champ autorisé")
    let fields = req.query.fields
    if (fields && !Array.isArray(fields))
        fields = [fields]

    UserService.findOneUser(fields, req.query.value, null, function(err, value) {        
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

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get multiple users by IDs
 *     description: Retrieve multiple users by their IDs.
 *     tags: 
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["6696711304c71eaa5de75189", "6696711304c71eaa5de75187"]
 *         description: The list of user IDs
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       405:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Internal server error.
 */
// La fonction permet de chercher plusieurs utilisateurs
module.exports.findManyUsersById = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Recherche de plusieurs utilisateurs", req.query.id)
    var arg = req.query.id
    if (arg && !Array.isArray(arg))
        arg=[arg]
    UserService.findManyUsersById(arg, null, function(err, value) {
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

/**
 * @swagger
 * /users_by_filters:
 *   get:
 *     summary: Get a list of users
 *     description: Retrieve a paginated list of users with optional search query. This endpoint is protected by JWT.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: The page number to retrieve
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: pageSize
 *         in: query
 *         description: The number of users per page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: q
 *         in: query
 *         description: The search query to filter users
 *         required: false
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 count:
 *                   type: integer
 *                   description: The total number of users
 *                   example: 100
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       405:
 *          $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Unauthorized. Invalid or missing token.
 *       500:
 *         description: Internal server error.
 */
// La fonction permet de chercher plusieurs utilisateurs
module.exports.findManyUsers = function(req, res) {
    req.log.info("Recherche de plusieurs utilisateurs")
    let page = req.query.page
    let pageSize = req.query.pageSize
    let searchValue = req.query.q
    UserService.findManyUsers(searchValue, pageSize, page,  null, function(err, value) {        
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

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Update a user
 *     description: Update user information with the given details.
 *     tags: 
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       405:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Internal server error.
 */
// La fonction permet de modifier un utilisateur
module.exports.updateOneUser = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Modification d'un utilisateur")
    UserService.updateOneUser(req.params.id, req.body, null, function(err, value) {
        //
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

/**
 * @swagger
 * /users:
 *   put:
 *     summary: Update multiple users
 *     description: Update multiple users with the provided details.
 *     tags: 
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["6696711304c71eaa5de75189", "6696711304c71eaa5de75187"]
 *         description: The list of user IDs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Users updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       405:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Internal server error.
 */
// La fonction permet de modifier plusieurs utilisateurs
module.exports.updateManyUsers = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Modification de plusieurs utilisateurs")
    var arg = req.query.id
    if (arg && !Array.isArray(arg))
        arg = [arg]
    var updateData = req.body
    UserService.updateManyUsers(arg, updateData, null, function(err, value) {
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

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Delete a user by their ID.
 *     tags: 
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       405:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Internal server error.
 */
// La fonction permet de supprimer un utilisateur
module.exports.deleteOneUser = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Suppression d'un utilisateur")
    UserService.deleteOneUser(req.params.id, null, function(err, value) {        
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

/**
 * @swagger
 * /users:
 *   delete:
 *     summary: Delete multiple users
 *     description: Delete multiple users by their IDs.
 *     tags: 
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["6696711304c71eaa5de75189", "6696711304c71eaa5de75187"]
 *         description: The list of user IDs
 *     responses:
 *       200:
 *         description: Users deleted successfully.
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       405:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Internal server error.
 */
// La fonction permet de supprimer plusieurs utilisateurs
module.exports.deleteManyUsers = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Suppression de plusieurs utilisateur")
    var arg = req.query.id
    if (arg && !Array.isArray(arg))
        arg = [arg]
    UserService.deleteManyUsers(arg, null, function(err, value) {
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
