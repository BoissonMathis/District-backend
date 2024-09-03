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

// Déclaration des middlewares
const DatabaseMiddleware = require("./middlewares/database");
const LoggerMiddleware = require("./middlewares/logger");

// Déclaration des middlewares à express
app.use(bodyParser.json(), LoggerMiddleware.addLogger);

const upload = require("./utils/multer.config");
const UserSchema = require("./schemas/User");
const mongoose = require("mongoose");
var User = mongoose.model("User", UserSchema);

app.post("/upload/profil_picture", upload.single("file"), async (req, res) => {
  try {
    const userId = req.query.user_id;
    const picture = req.file ? `/images/${req.file.filename}` : null;

    if (!picture) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const oldPicturePath = currentUser.profil_image;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profil_image: `http://localhost:3000/data${picture}` },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    if (
      oldPicturePath &&
      oldPicturePath.startsWith("http://localhost:3000/data/")
    ) {
      const oldImagePath = path.join(
        __dirname,
        oldPicturePath.replace("http://localhost:3000", ".")
      );

      fs.access(oldImagePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error(
                `Failed to delete old image at ${oldImagePath}: ${err.message}`
              );
            } else {
              console.log(`Successfully deleted old image at ${oldImagePath}`);
            }
          });
        } else {
          console.error(`Old image not found at ${oldImagePath}`);
        }
      });
    }

    res.status(200).json({
      message: "Profile picture updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/upload/banner_picture", upload.single("file"), async (req, res) => {
  try {
    const userId = req.query.user_id;
    const picture = req.file ? `/images/${req.file.filename}` : null;

    if (!picture) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const oldPicturePath = currentUser.banner_image;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { banner_image: `http://localhost:3000/data${picture}` },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    if (
      oldPicturePath &&
      oldPicturePath.startsWith("http://localhost:3000/data/")
    ) {
      const oldImagePath = path.join(
        __dirname,
        oldPicturePath.replace("http://localhost:3000", ".")
      );

      fs.access(oldImagePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error(
                `Failed to delete old image at ${oldImagePath}: ${err.message}`
              );
            } else {
              console.log(`Successfully deleted old image at ${oldImagePath}`);
            }
          });
        } else {
          console.error(`Old image not found at ${oldImagePath}`);
        }
      });
    }

    res.status(200).json({
      message: "Banner picture updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
  "/event/:id",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  EventController.deleteOneEvent
);

app.delete(
  "/events",
  DatabaseMiddleware.checkConnexion,
  passport.authenticate("jwt", { session: false }),
  EventController.deleteManyEvents
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
