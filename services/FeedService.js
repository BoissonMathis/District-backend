const PostSchema = require("../schemas/Post");
const UserSchema = require("../schemas/User");
const _ = require("lodash");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { Types } = mongoose;

let Post = mongoose.model("Post", PostSchema);
let User = mongoose.model("User", UserSchema);

// Post.createIndexes()
// User.createIndexes()

module.exports.getUserConnectedFeed = async function (user_id, opts, callback) {
  if (!user_id || !mongoose.isValidObjectId(user_id)) {
    return callback({ msg: "ObjectId non conforme.", type_error: "no-valid" });
  }

  try {
    const user = await User.findById(user_id).exec();
    // console.log('utilisateur :', user)
    if (!user || !Array.isArray(user.follows)) {
      return callback({
        msg: "Aucun utilisateur trouvé.",
        type_error: "no-found",
      });
    }

    if (!user.follows.every((e) => mongoose.isValidObjectId(e))) {
      return callback({
        msg: "ObjectId non conforme.",
        type_error: "no-valid",
      });
    }

    const posts = await Post.aggregate([
      {
        $match: {
          $or: [
            {
              user: {
                $in: user.follows.map((id) => new mongoose.Types.ObjectId(id)),
              },
            }, // Posts créés par les utilisateurs suivis
            {
              repostedBy: {
                $in: user.follows.map((id) => new mongoose.Types.ObjectId(id)),
              },
            }, // Posts repostés par les utilisateurs suivis
          ],
        },
      },
      {
        $sort: { created_at: -1 }, // Trier par date de création, ordre décroissant
      },
      {
        $group: {
          _id: "$user",
          posts: { $push: "$$ROOT" }, // Regrouper les posts par utilisateurs
        },
      },
      {
        $project: {
          posts: { $slice: ["$posts", 5] }, // Limiter à 5 posts par utilisateur
        },
      },
      {
        $unwind: "$posts", // Désagréger les posts pour permettre le tri global
      },
      {
        $lookup: {
          from: "users", // Nom de la collection des utilisateurs
          localField: "posts.user", // Le champ 'user' dans les documents 'posts'
          foreignField: "_id", // Le champ '_id' dans la collection 'users'
          as: "userDetails",
          pipeline: [
            {
              $project: {
                token: 0,
                password: 0,
                email: 0,
              },
            },
          ], // Le nom du champ pour le résultat de la jointure
        },
      },
      {
        $unwind: "$userDetails", // Désagréger le tableau 'userDetails' pour obtenir un seul document utilisateur
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$posts", { user: "$userDetails" }], // Fusionner les infos de l'utilisateur avec le post
          },
        },
      },
      {
        $sort: { created_at: -1 }, // Trier à nouveau pour obtenir un tri global par date
      },
      {
        $limit: 50, // Limiter à 50 posts en tout
      },
    ]);

    callback(null, { count: posts.length, posts: posts });
  } catch (err) {
    callback({
      msg: "Erreur lors de la récupération du feed.",
      type_error: "no-valid",
    });
  }
};
