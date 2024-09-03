const UserSchema = require("../schemas/User");
const _ = require("lodash");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

var User = mongoose.model("User", UserSchema);

module.exports.follow = async function (user_id, follow_id, options, callback) {
  if (
    user_id &&
    mongoose.isValidObjectId(user_id) &&
    follow_id &&
    mongoose.isValidObjectId(follow_id)
  ) {
    try {
      const userToFollow = await User.findById(follow_id);
      if (!userToFollow) {
        return callback({
          msg: "L'utilisateur à suivre n'existe pas.",
          type_error: "no-found",
        });
      }

      const user = await User.findById(user_id);
      if (user) {
        if (user.follows && !user.follows.includes(follow_id)) {
          user.follows.push(follow_id);
          user.updated_at = new Date();

          const updatedUser = await user.save();
          callback(null, updatedUser.toObject());
        } else {
          callback({
            msg: "Utilisateur déjà follow.",
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

module.exports.unfollow = async function (
  user_id,
  unfollow_id,
  options,
  callback
) {
  if (user_id && mongoose.isValidObjectId(user_id)) {
    console.log(unfollow_id);
    try {
      if (!mongoose.isValidObjectId(unfollow_id)) {
        return callback({
          msg: "L'ID de l'utilisateur à unfollow n'est pas valide.",
          type_error: "no-valid",
        });
      }

      const user = await User.findById(user_id);
      if (user) {
        if (user.follows && user.follows.includes(unfollow_id)) {
          user.follows = user.follows.filter(
            (id) => id.toString() !== unfollow_id.toString()
          );
          user.updated_at = new Date();

          const updatedUser = await user.save();
          callback(null, updatedUser.toObject());
        } else {
          callback({
            msg: "L'utilisateur n'est pas suivi.",
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

// connaitre l'utilisateur connecté
// connaitre l'utilisateur a unfollow
// method delete la propriété follow de l'utilisateur connecté et supprimer l'_id de l'utilisateur a unfollow
