const express = require("express");
const _ = require("lodash");
const bodyParser = require("body-parser");
const Config = require("./config");
const Logger = require("./utils/logger").pino;
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");
// const cookieParser = require('cookie-parser');

// Création de notre application express.js
const app = express();
app.use("/data/images", express.static(path.join(__dirname, "/data/images")));

// Configuration Swagger
const swaggerOptions = require("./swagger.json");
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Démarrage de la database
require("./utils/database");

const cors = require("cors");
const corsOptions = {
  origin: "http://localhost:3001",
  // credentials: true // pour le cookies
};
app.use(cors(corsOptions));

// Ajout du module de login
const passport = require("./utils/passport");
// passport init

var session = require("express-session");

app.use(
  session({
    secret: Config.secret_cookie,
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: process.env.NODE_ENV === 'production' } // Utiliser secure seulement en production
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/images", express.static(path.join(__dirname, "../data/image")));
// app.use(cookieParser())

// Déclaration des controllers pour l'utilisateur
const UserController = require("./controllers/UserController");
const PostController = require("./controllers/PostController");
const CommentController = require("./controllers/CommentController");
const EventController = require("./controllers/EventController");
const FeedController = require("./controllers/FeedController");
const FollowController = require("./controllers/FollowController");
const LikeController = require("./controllers/LikeController");
const RepostController = require("./controllers/RepostController");
const ImagesController = require("./controllers/ImagesController");

// Déclaration des middlewares
const DatabaseMiddleware = require("./middlewares/database");
const LoggerMiddleware = require("./middlewares/logger");

// Déclaration des middlewares à express
app.use(bodyParser.json(), LoggerMiddleware.addLogger);

const upload = require("./utils/multer.config");

/*--------------------- Création des routes (User - Utilisateur) ---------------------*/
app.post(
  "/upload/profil_picture",
  DatabaseMiddleware.checkConnexion,
  upload.single("file"),
  ImagesController.updateProfilePicture
);

app.post(
  "/upload/banner_picture",
  upload.single("file"),
  ImagesController.updateBannerPicture
);

/*--------------------- Création des routes (User - Utilisateur) ---------------------*/
app.post("/login", DatabaseMiddleware.checkConnexion, UserController.loginUser);

app.post(
  "/logout/:id",
  DatabaseMiddleware.checkConnexion,
  UserController.logoutUser
);

// Création du endpoint /user pour l'ajout d'un utilisateur
app.post("/user", DatabaseMiddleware.checkConnexion, UserController.addOneUser);

// Création du endpoint /user pour l'ajout de plusieurs utilisateurs
app.post(
  "/users",
  DatabaseMiddleware.checkConnexion,
  UserController.addManyUsers
);

// Création du endpoint /user pour la récupération d'un utilisateur par le champ selectionné
app.get(
  "/user",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  UserController.findOneUser
);

// Création du endpoint /user pour la récupération d'un utilisateur via l'id
app.get(
  "/user/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  UserController.findOneUserById
);

// Création du endpoint /user pour la récupération de plusieurs utilisateurs via l'idS
app.get(
  "/users",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  UserController.findManyUsersById
);

// Création du endpoint /users_by_filters pour la récupération de plusieurs utilisateurs
app.get(
  "/users_by_filters",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  UserController.findManyUsers
);

// Création du endpoint /user pour la modification d'un utilisateur
app.put(
  "/user/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  UserController.updateOneUser
);

// Création du endpoint /user pour la modification de plusieurs utilisateurs
app.put(
  "/users",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  UserController.updateManyUsers
);

// Création du endpoint /user pour la suppression d'un utilisateur
app.delete(
  "/user/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  UserController.deleteOneUser
);

// Création du endpoint /user pour la suppression de plusieurs utilisateurs
app.delete(
  "/users",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  UserController.deleteManyUsers
);

/*--------------------- Création des routes (Post - posts) ---------------------*/
app.post(
  "/post",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  upload.single("image"), // Middleware pour accepter une seule image
  PostController.addOnePost
);

app.post(
  "/posts",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  PostController.addManyPosts
);

app.get(
  "/post/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  PostController.findOnePostById
);

app.get(
  "/posts",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  PostController.findManyPostsById
);

app.get(
  "/post",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  PostController.findOnePost
);

app.get(
  "/posts_by_filters",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  PostController.findManyPosts
);

app.put(
  "/post/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  PostController.updateOnePost
);

app.put(
  "/posts",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  PostController.updateManyPosts
);

app.delete(
  "/post/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  PostController.deleteOnePost
);

app.delete(
  "/posts",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  PostController.deleteManyPosts
);

/*--------------------- Création des routes (Comment - comments) ---------------------*/
app.post(
  "/comment",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  CommentController.addOneComment
);

app.post(
  "/comments",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  CommentController.addManyComments
);

app.get(
  "/comment/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  CommentController.findOneCommentById
);

app.get(
  "/comments",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  CommentController.findManyCommentsById
);

app.get(
  "/comment",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  CommentController.findOneComment
);

app.get(
  "/comments_by_filters",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  CommentController.findManyComments
);

app.put(
  "/comment/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  CommentController.updateOneComment
);

app.put(
  "/comments",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  CommentController.updateManyComments
);

app.delete(
  "/comment/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  CommentController.deleteOneComment
);

app.delete(
  "/comments",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  CommentController.deleteManyComments
);

/*--------------------- Création des routes (Event - events) ---------------------*/
app.post(
  "/event",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  EventController.addOneEvent
);

app.post(
  "/events",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  EventController.addManyEvents
);

app.get(
  "/event/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  EventController.findOneEventById
);

app.get(
  "/events",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  EventController.findManyEventsById
);

app.get(
  "/event",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  EventController.findOneEvent
);

app.get(
  "/events_by_filters",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  EventController.findManyEvents
);

app.put(
  "/event/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  EventController.updateOneEvent
);

app.put(
  "/events",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  EventController.updateManyEvents
);

app.delete(
  "/events",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  EventController.deleteManyEvents
);

app.post(
  "/event/candidate",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  EventController.addEventCandidate
);

app.post(
  "/event/candidate_validate",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  EventController.addEventCandidateValidate
);

app.delete(
  "/event/candidate",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  EventController.deleteEventCandidate
);

app.delete(
  "/event/candidate_validate",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  EventController.deleteEventCandidateValidate
);

app.delete(
  "/event/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  EventController.deleteOneEvent
);

/*--------------------- Création des routes (Feed) ---------------------*/
app.get(
  "/feed/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  FeedController.getUserConnectedFeed
);

/*--------------------- Création des routes (Follow) ---------------------*/
app.put(
  "/follow/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  FollowController.follow
);

app.delete(
  "/unfollow/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  FollowController.unfollow
);

/*--------------------- Création des routes (Like) ---------------------*/
app.put(
  "/like/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  LikeController.like
);

app.delete(
  "/dislike/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  LikeController.dislike
);

/*--------------------- Création des routes (Repost) ---------------------*/
app.put(
  "/repost/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  RepostController.repost
);

app.delete(
  "/cancelrepost/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  RepostController.cancelrepost
);

// démarrage du serveur au port définit
app.listen(Config.port, () => {
  Logger.info(`(INFO) ${new Date().toLocaleString()}: Le serveur a démarré`);
});

module.exports = app;
