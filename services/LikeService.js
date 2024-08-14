const UserSchema = require("../schemas/User");
const PostSchema = require("../schemas/Post");
const _ = require("lodash");
const mongoose = require("mongoose");
const { post } = require("../server");
const ObjectId = mongoose.Types.ObjectId;

var Post = mongoose.model("Post", PostSchema);
var User = mongoose.model("User", UserSchema);

module.exports.like = async function (user_id, post_id, options, callback) {
  if (
    user_id &&
    mongoose.isValidObjectId(user_id) &&
    post_id &&
    mongoose.isValidObjectId(post_id)
  ) {
    try {
      const postToLike = await Post.findById(post_id);
      const user = await User.findById(user_id);

      if (!user) {
        return callback({
          msg: "Utilisateur introuvable.",
          type_error: "no-found",
        });
      }

      if (!postToLike) {
        return callback({
          msg: "Post introuvable.",
          type_error: "no-found",
        });
      }

      if (postToLike.user.toString() == user_id) {
        return callback({
          msg: "Le créateur du post ne peux pas like",
          type_error: "no-valid",
        });
      }

      if (postToLike) {
        if (postToLike.like && !postToLike.like.includes(user_id)) {
          postToLike.like.push(user_id);
          postToLike.updated_at = new Date();

          const updatedPost = await postToLike.save();
          callback(null, updatedPost.toObject());
        } else {
          callback({
            msg: "Post deja like.",
            type_error: "no-valid",
          });
        }
      } else {
        callback({
          msg: "Aucun utilisateur trouvé.",
          type_error: "no-found",
        });
      }
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        const duplicateErrors = {
          msg: `Duplicate key error: ${field} must be unique.`,
          fields_with_error: [field],
          fields: { [field]: `The ${field} is already taken.` },
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

module.exports.dislike = async function (user_id, post_id, options, callback) {
  if (user_id && mongoose.isValidObjectId(user_id)) {
    try {
      if (!mongoose.isValidObjectId(post_id)) {
        return callback({
          msg: "ID du post invalid.",
          type_error: "no-valid",
        });
      }

      const post = await Post.findById(post_id);
      if (post) {
        if (post.like && post.like.includes(user_id)) {
          post.like = post.like.filter(
            (id) => id.toString() !== user_id.toString()
          );
          post.updated_at = new Date();

          const updatedPost = await post.save();
          callback(null, updatedPost.toObject());
        } else {
          callback({
            msg: "Le post n'est pas like.",
            type_error: "no-valid",
          });
        }
      } else {
        callback({
          msg: "Aucun utilisateur trouvé.",
          type_error: "no-found",
        });
      }
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        const duplicateErrors = {
          msg: `Duplicate key error: ${field} must be unique.`,
          fields_with_error: [field],
          fields: { [field]: `The ${field} is already taken.` },
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
