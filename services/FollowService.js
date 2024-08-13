const UserSchema = require("../schemas/User");
const _ = require("lodash");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

var User = mongoose.model("User", UserSchema);

module.exports.follow = async function (user_id, follow_id, options, callback) {
  if (user_id && mongoose.isValidObjectId(user_id)) {
    User.findById(user_id)
      .then((value) => {
        try {
          if (value) {
            let update = {};
            update.follows = value.follows;
            if (follow_id && mongoose.isValidObjectId(follow_id)) {
              if (!value["follows"].includes(follow_id)) {
                update.follows.push(follow_id);
                update.updated_at = new Date();
                User.findByIdAndUpdate(new ObjectId(user_id), update, {
                  returnDocument: "after",
                  runValidators: true,
                })
                  .then((value) => {
                    try {
                      if (value) callback(null, value.toObject());
                      else
                        callback({
                          msg: "Utilisateur non trouvé.",
                          type_error: "no-found",
                        });
                    } catch (e) {
                      callback(e);
                    }
                  })
                  .catch((errors) => {
                    if (errors.code === 11000) {
                      var field = Object.keys(errors.keyPattern)[0];
                      const duplicateErrors = {
                        msg: `Duplicate key error: ${field} must be unique.`,
                        fields_with_error: [field],
                        fields: { [field]: `The ${field} is already taken.` },
                        type_error: "duplicate",
                      };
                      callback(duplicateErrors);
                    } else {
                      errors = errors["errors"];
                      var text = Object.keys(errors)
                        .map((e) => {
                          return errors[e]["properties"]["message"];
                        })
                        .join(" ");
                      var fields = _.transform(
                        Object.keys(errors),
                        function (result, value) {
                          result[value] =
                            errors[value]["properties"]["message"];
                        },
                        {}
                      );
                      var err = {
                        msg: text,
                        fields_with_error: Object.keys(errors),
                        fields: fields,
                        type_error: "validator",
                      };
                      callback(err);
                    }
                  });
              } else {
                callback({
                  msg: "Utilisateur déja follow",
                  type_error: "no-valid",
                });
              }
            }
          } else {
            callback({
              msg: "Aucun utilisateur trouvé.",
              type_error: "no-found",
            });
          }
        } catch (e) {
          console.log(e);
        }
      })
      .catch((err) => {
        callback({
          msg: "Impossible de chercher l'élément.",
          type_error: "error-mongo",
        });
      });
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
    User.findById(user_id)
      .then((value) => {
        try {
          if (value) {
            let update = {};
            update.follows = value.follows;

            if (unfollow_id && mongoose.isValidObjectId(unfollow_id)) {
              if (value["follows"].includes(unfollow_id)) {
                update.follows = update.follows.filter(
                  (id) => id.toString() !== unfollow_id.toString()
                );
                update.updated_at = new Date();
                User.findByIdAndUpdate(
                  new mongoose.Types.ObjectId(user_id),
                  update,
                  { returnDocument: "after", runValidators: true }
                )
                  .then((value) => {
                    try {
                      if (value) callback(null, value.toObject());
                      else
                        callback({
                          msg: "Utilisateur non trouvé.",
                          type_error: "no-found",
                        });
                    } catch (e) {
                      callback(e);
                    }
                  })
                  .catch((errors) => {
                    if (errors.code === 11000) {
                      var field = Object.keys(errors.keyPattern)[0];
                      const duplicateErrors = {
                        msg: `Duplicate key error: ${field} must be unique.`,
                        fields_with_error: [field],
                        fields: { [field]: `The ${field} is already taken.` },
                        type_error: "duplicate",
                      };
                      callback(duplicateErrors);
                    } else {
                      errors = errors["errors"];
                      var text = Object.keys(errors)
                        .map((e) => {
                          return errors[e]["properties"]["message"];
                        })
                        .join(" ");
                      var fields = _.transform(
                        Object.keys(errors),
                        function (result, value) {
                          result[value] =
                            errors[value]["properties"]["message"];
                        },
                        {}
                      );
                      var err = {
                        msg: text,
                        fields_with_error: Object.keys(errors),
                        fields: fields,
                        type_error: "validator",
                      };
                      callback(err);
                    }
                  });
              } else {
                callback({
                  msg: "L'utilisateur n'est pas follow.",
                  type_error: "no-valid",
                });
              }
            }
          } else {
            callback({
              msg: "Aucun utilisateur trouvé.",
              type_error: "no-found",
            });
          }
        } catch (e) {
          console.log(e);
        }
      })
      .catch((err) => {
        callback({
          msg: "Impossible de chercher l'élément.",
          type_error: "error-mongo",
        });
      });
  } else {
    callback({ msg: "ObjectId non conforme.", type_error: "no-valid" });
  }
};

// connaitre l'utilisateur connecté
// connaitre l'utilisateur a unfollow
// method delete la propriété follow de l'utilisateur connecté et supprimer l'_id de l'utilisateur a unfollow
