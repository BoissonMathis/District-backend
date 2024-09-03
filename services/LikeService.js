const UserSchema = require("../schemas/User");
const PostSchema = require("../schemas/Post");
const CommentSchema = require("../schemas/Comment");
const _ = require("lodash");
const mongoose = require("mongoose");
const { post } = require("../server");
const ObjectId = mongoose.Types.ObjectId;

var Post = mongoose.model("Post", PostSchema);
var User = mongoose.model("User", UserSchema);
var Comment = mongoose.model("Comment", CommentSchema);

module.exports.like = async function (
  user_id,
  item_id,
  type,
  options,
  callback
) {
  if (
    user_id &&
    mongoose.isValidObjectId(user_id) &&
    item_id &&
    mongoose.isValidObjectId(item_id)
  ) {
    try {
      const user = await User.findById(user_id);

      if (!user) {
        return callback({
          msg: "Utilisateur introuvable.",
          type_error: "no-found",
        });
      }

      if (type !== "comment" && type !== "post") {
        return callback({
          msg: "Type non valide.",
          type_error: "no-valid",
        });
      }

      let itemToLike;
      if (type === "post") {
        itemToLike = await Post.findById(item_id);

        if (!itemToLike) {
          return callback({
            msg: "Post introuvable.",
            type_error: "no-found",
          });
        }

        if (itemToLike.user.toString() === user_id) {
          return callback({
            msg: "Le créateur du post ne peut pas liker son propre post.",
            type_error: "no-valid",
          });
        }
      } else if (type === "comment") {
        itemToLike = await Comment.findById(item_id);
        if (!itemToLike) {
          return callback({
            msg: "Commentaire introuvable.",
            type_error: "no-found",
          });
        }

        if (itemToLike.user.toString() === user_id) {
          return callback({
            msg: "Le créateur du commentaire ne peut pas liker son propre commentaire.",
            type_error: "no-valid",
          });
        }
      } else {
        return callback({
          msg: "Type non valide. Le type doit être 'post' ou 'comment'.",
          type_error: "no-valid",
        });
      }

      if (itemToLike.like && !itemToLike.like.includes(user_id)) {
        itemToLike.like.push(user_id);
        itemToLike.updated_at = new Date();

        const updatedItem = await itemToLike.save();
        callback(null, updatedItem.toObject());
      } else {
        callback({
          msg: "Déjà liké.",
          type_error: "no-valid",
        });
      }
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        const duplicateErrors = {
          msg: `Erreur de clé en double : ${field} doit être unique.`,
          fields_with_error: [field],
          fields: { [field]: `Le ${field} est déjà pris.` },
          type_error: "duplicate",
        };
        callback(duplicateErrors);
      } else if (err.errors) {
        const errors = err.errors;
        const text = Object.keys(errors)
          .map((e) => errors[e]["properties"]["message"])
          .join(" ");
        const fields = Object.keys(errors).reduce((result, value) => {
          result[value] = errors[value]["properties"]["message"];
          return result;
        }, {});
        const errResponse = {
          msg: text,
          fields_with_error: Object.keys(errors),
          fields: fields,
          type_error: "validator",
        };
        callback(errResponse);
      } else {
        callback({
          msg: "Erreur lors de la mise à jour.",
          type_error: "error-mongo",
          error: err,
        });
      }
    }
  } else {
    callback({ msg: "ObjectId non conforme.", type_error: "no-valid" });
  }
};

module.exports.dislike = async function (
  user_id,
  item_id,
  type,
  options,
  callback
) {
  if (
    user_id &&
    mongoose.isValidObjectId(user_id) &&
    item_id &&
    mongoose.isValidObjectId(item_id)
  ) {
    try {
      // Validation du type
      if (type !== "comment" && type !== "post") {
        return callback({
          msg: "Type non valide. Le type doit être 'post' ou 'comment'.",
          type_error: "no-valid",
          statusCode: 405, // Ajout du code de statut HTTP 405
        });
      }

      const user = await User.findById(user_id);

      if (!user) {
        return callback({
          msg: "Utilisateur introuvable.",
          type_error: "no-found",
        });
      }

      let itemToDislike;
      if (type === "post") {
        itemToDislike = await Post.findById(item_id);

        if (!itemToDislike) {
          return callback({
            msg: "Post introuvable.",
            type_error: "no-found",
          });
        }
      } else if (type === "comment") {
        itemToDislike = await Comment.findById(item_id);

        if (!itemToDislike) {
          return callback({
            msg: "Commentaire introuvable.",
            type_error: "no-found",
          });
        }
      }

      if (itemToDislike.like && itemToDislike.like.includes(user_id)) {
        itemToDislike.like = itemToDislike.like.filter(
          (id) => id.toString() !== user_id.toString()
        );
        itemToDislike.updated_at = new Date();

        const updatedItem = await itemToDislike.save();
        callback(null, updatedItem.toObject());
      } else {
        callback({
          msg:
            type === "post"
              ? "Le post n'est pas liké."
              : "Le commentaire n'est pas liké.",
          type_error: "no-valid",
        });
      }
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        const duplicateErrors = {
          msg: `Erreur de clé en double : ${field} doit être unique.`,
          fields_with_error: [field],
          fields: { [field]: `Le ${field} est déjà pris.` },
          type_error: "duplicate",
        };
        callback(duplicateErrors);
      } else if (err.errors) {
        const errors = err.errors;
        const text = Object.keys(errors)
          .map((e) => errors[e]["properties"]["message"])
          .join(" ");
        const fields = Object.keys(errors).reduce((result, value) => {
          result[value] = errors[value]["properties"]["message"];
          return result;
        }, {});
        const errResponse = {
          msg: text,
          fields_with_error: Object.keys(errors),
          fields: fields,
          type_error: "validator",
        };
        callback(errResponse);
      } else {
        callback({
          msg: "Erreur lors de la mise à jour.",
          type_error: "error-mongo",
          error: err,
        });
      }
    }
  } else {
    callback({
      msg: !mongoose.isValidObjectId(user_id)
        ? "user_id ObjectId non conforme."
        : "item_id ObjectId non conforme.",
      type_error: "no-valid",
    });
  }
};
