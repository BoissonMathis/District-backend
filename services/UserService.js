const UserSchema = require("../schemas/User");
const _ = require("lodash");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcrypt");
const TokenUtils = require("./../utils/token");
// const cookieParser = require('cookie-parser');
const SALT_WORK_FACTOR = 10;

var User = mongoose.model("User", UserSchema);

User.createIndexes();

module.exports.loginUser = async function (
  username,
  password,
  options,
  callback
) {
  if (username !== "" && password !== "") {
    // Recherche de l'utilisateur par nom d'utilisateur ou email
    module.exports.findOneUser(
      ["username", "email"],
      username,
      null,
      async (err, value) => {
        if (err) {
          callback(err);
        } else {
          if (bcrypt.compareSync(password, value.password)) {
            var token = TokenUtils.createToken({ _id: value._id }, null);
            // Mise à jour du token dans la base de données
            User.findByIdAndUpdate(
              value._id,
              { token: token },
              { returnDocument: "after", runValidators: true }
            )
              .then((updatedUser) => {
                try {
                  if (updatedUser) {
                    // Mise à jour des chemins des images
                    updatedUser.profil_image =
                      updatedUser.profil_image ||
                      "https://journalmetro.com/wp-content/uploads/2017/04/default_profile_400x400.png?resize=400%2C400?fit=160%2C160";
                    updatedUser.banner_image =
                      updatedUser.banner_image ||
                      "https://journalmetro.com/wp-content/uploads/2017/04/default_profile_400x400.png?resize=400%2C400?fit=160%2C160";

                    callback(null, updatedUser.toObject());
                  } else {
                    callback({
                      msg: "Utilisateur non trouvé.",
                      type_error: "no-found",
                    });
                  }
                } catch (e) {
                  callback(e);
                }
              })
              .catch((e) => {
                console.log(e);
                callback({
                  msg: "Erreur lors de la mise à jour de l'utilisateur.",
                  type_error: "update-error",
                });
              });
          } else {
            callback({
              msg: "La comparaison des mots de passe est incorrecte.",
              type_error: "no_comparaison",
            });
          }
        }
      }
    );
  } else {
    callback({
      msg: "Nom d'utilisateur ou mot de passe manquant.",
      type_error: "no-valid",
    });
  }
};

module.exports.logoutUser = async function (user_id, options, callback) {
  User.findByIdAndUpdate(
    new ObjectId(user_id),
    { token: "" },
    { returnDocument: "after", runValidators: true }
  )
    .then((value) => {
      try {
        if (value) {
          callback(null, value.toObject());
        } else {
          callback({ msg: "Utilisateur non trouvé.", type_error: "no-found" });
        }
      } catch (e) {
        callback(e);
      }
    })
    .catch((e) => {
      console.log(e);
    });
};

module.exports.addOneUser = async function (user, options, callback) {
  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    if (user && user.password) {
      user.password = await bcrypt.hash(user.password, salt);
    }
    var new_user = new User(user);
    var errors = new_user.validateSync();
    if (errors) {
      errors = errors["errors"];
      var path = Object.keys(errors).map((e) => {
        return errors[e]["properties"]["path"];
      });
      var fields = _.transform(
        Object.keys(errors),
        function (result, value) {
          result[value] = errors[value]["properties"]["message"];
        },
        {}
      );
      var err = {
        msg: `Veuillez renseigner un(e) ${path}`,
        fields_with_error: Object.keys(errors),
        fields: fields,
        type_error: "validator",
      };
      callback(err);
    } else {
      await new_user.save();
      callback(null, new_user.toObject());
    }
  } catch (error) {
    if (error.code === 11000) {
      // Erreur de duplicité
      var field = Object.keys(error.keyValue)[0];
      var err = {
        msg: `Ce ${field} exist déja.`,
        fields_with_error: [field],
        fields: { [field]: `The ${field} is already taken.` },
        type_error: "duplicate",
      };
      callback(err);
    } else {
      callback(error); // Autres erreurs
    }
  }
};

module.exports.addManyUsers = async function (users, options, callback) {
  var errors = [];

  // Vérifier les erreurs de validation
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    if (user && user.password) {
      user.password = await bcrypt.hash(user.password, salt);
    }
    var new_user = new User(user);
    var error = new_user.validateSync();
    if (error) {
      error = error["errors"];
      var text = Object.keys(error)
        .map((e) => {
          return error[e]["properties"]["message"];
        })
        .join(" ");
      var fields = _.transform(
        Object.keys(error),
        function (result, value) {
          result[value] = error[value]["properties"]["message"];
        },
        {}
      );
      errors.push({
        msg: text,
        fields_with_error: Object.keys(error),
        fields: fields,
        index: i,
        type_error: "validator",
      });
    }
  }
  if (errors.length > 0) {
    callback(errors);
  } else {
    try {
      // Tenter d'insérer les utilisateurs
      const data = await User.insertMany(users, { ordered: false });
      callback(null, data);
    } catch (error) {
      if (error.code === 11000) {
        // Erreur de duplicité
        const duplicateErrors = error.writeErrors.map((err) => {
          //const field = Object.keys(err.keyValue)[0];
          const field = err.err.errmsg
            .split(" dup key: { ")[1]
            .split(":")[0]
            .trim();
          return {
            msg: `Duplicate key error: ${field} must be unique.`,
            fields_with_error: [field],
            fields: { [field]: `The ${field} is already taken.` },
            index: err.index,
            type_error: "duplicate",
          };
        });
        callback(duplicateErrors);
      } else {
        callback(error); // Autres erreurs
      }
    }
  }
};

module.exports.findOneUserById = function (user_id, options, callback) {
  if (user_id && mongoose.isValidObjectId(user_id)) {
    User.findById(user_id)
      .then((user) => {
        try {
          if (user) {
            // Inclure les URLs des images dans l'objet renvoyé
            const userObject = user.toObject();
            userObject.profil_image_url = user.profil_image;
            userObject.banner_image_url = user.banner_image;

            callback(null, userObject);
          } else {
            callback({
              msg: "Aucun utilisateur trouvé.",
              type_error: "no-found",
            });
          }
        } catch (e) {
          callback(e);
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

module.exports.findManyUsersById = function (users_id, options, callback) {
  if (
    users_id &&
    Array.isArray(users_id) &&
    users_id.length > 0 &&
    users_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length == users_id.length
  ) {
    users_id = users_id.map((e) => {
      return new ObjectId(e);
    });
    User.find({ _id: users_id })
      .then((value) => {
        try {
          if (value && Array.isArray(value) && value.length != 0) {
            callback(null, value);
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
  } else if (
    users_id &&
    Array.isArray(users_id) &&
    users_id.length > 0 &&
    users_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length != users_id.length
  ) {
    callback({
      msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.",
      type_error: "no-valid",
      fields: users_id.filter((e) => {
        return !mongoose.isValidObjectId(e);
      }),
    });
  } else if (users_id && !Array.isArray(users_id)) {
    callback({
      msg: "L'argument n'est pas un tableau.",
      type_error: "no-valid",
    });
  } else {
    callback({ msg: "Tableau non conforme.", type_error: "no-valid" });
  }
};

module.exports.findOneUser = function (tab_field, value, options, callback) {
  var field_unique = ["username", "email"];

  if (
    tab_field &&
    Array.isArray(tab_field) &&
    value &&
    _.filter(tab_field, (e) => {
      return field_unique.indexOf(e) == -1;
    }).length == 0
  ) {
    var obj_find = [];
    _.forEach(tab_field, (e) => {
      obj_find.push({ [e]: value });
    });
    User.findOne({ $or: obj_find })
      .then((value) => {
        if (value) {
          callback(null, value.toObject());
        } else {
          callback({ msg: "Utilisateur non trouvé.", type_error: "no-found" });
        }
      })
      .catch((err) => {
        callback({ msg: "Error interne mongo", type_error: "error-mongo" });
      });
  } else {
    let msg = "";
    if (!tab_field || !Array.isArray(tab_field)) {
      msg += "Les champs de recherche sont incorrecte.";
    }
    if (!value) {
      msg += msg
        ? " Et la valeur de recherche est vide"
        : "La valeur de recherche est vide";
    }
    if (
      _.filter(tab_field, (e) => {
        return field_unique.indexOf(e) == -1;
      }).length > 0
    ) {
      var field_not_authorized = _.filter(tab_field, (e) => {
        return field_unique.indexOf(e) == -1;
      });
      msg += msg
        ? ` Et (${field_not_authorized.join(
            ","
          )}) ne sont pas des champs de recherche autorisé.`
        : `Les champs (${field_not_authorized.join(
            ","
          )}) ne sont pas des champs de recherche autorisé.`;
      callback({
        msg: msg,
        type_error: "no-valid",
        field_not_authorized: field_not_authorized,
      });
    } else {
      callback({ msg: msg, type_error: "no-valid" });
    }
  }
};

module.exports.findManyUsers = function (
  search,
  limit,
  page,
  options,
  callback
) {
  page = !page ? 1 : parseInt(page);
  limit = !limit ? 10 : parseInt(limit);

  if (
    typeof page !== "number" ||
    typeof limit !== "number" ||
    isNaN(page) ||
    isNaN(limit)
  ) {
    callback({
      msg: `format de ${
        typeof page !== "number" ? "page" : "limit"
      } est incorrect`,
      type_error: "no-valid",
    });
  } else {
    let query_mongo = search
      ? {
          $or: _.map(["username", "email"], (e) => {
            return { [e]: { $regex: search } };
          }),
        }
      : {};
    User.countDocuments(query_mongo)
      .then((value) => {
        if (value > 0) {
          const skip = (page - 1) * limit;
          User.find(query_mongo, null, { skip: skip, limit: limit }).then(
            (results) => {
              callback(null, {
                count: value,
                results: results,
              });
            }
          );
        } else {
          callback(null, { count: 0, results: [] });
        }
      })
      .catch((e) => {
        callback(e);
      });
  }
};

module.exports.updateOneUser = async function (
  user_id,
  update,
  options,
  callback
) {
  if (user_id && mongoose.isValidObjectId(user_id)) {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    if (update && update.password) {
      update.password = await bcrypt.hash(update.password, salt);
    }
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
              result[value] = errors[value]["properties"]["message"];
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
    callback({ msg: "Id invalide.", type_error: "no-valid" });
  }
};

module.exports.updateManyUsers = async function (
  users_id,
  update,
  options,
  callback
) {
  if (
    users_id &&
    Array.isArray(users_id) &&
    users_id.length > 0 &&
    users_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length == users_id.length
  ) {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    if (update && update.password) {
      update.password = await bcrypt.hash(update.password, salt);
    }
    users_id = users_id.map((e) => {
      return new ObjectId(e);
    });
    User.updateMany({ _id: users_id }, update, { runValidators: true })
      .then((value) => {
        try {
          if (value && value.matchedCount != 0) {
            callback(null, value);
          } else {
            callback({
              msg: "Utilisateurs non trouvé",
              type_error: "no-found",
            });
          }
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
            index: errors.index,
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
              result[value] = errors[value]["properties"]["message"];
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
    callback({ msg: "Id invalide.", type_error: "no-valid" });
  }
};

module.exports.deleteOneUser = function (user_id, options, callback) {
  if (user_id && mongoose.isValidObjectId(user_id)) {
    User.findByIdAndDelete(user_id)
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
      .catch((e) => {
        callback({
          msg: "Impossible de chercher l'élément.",
          type_error: "error-mongo",
        });
      });
  } else {
    callback({ msg: "Id invalide.", type_error: "no-valid" });
  }
};

module.exports.deleteManyUsers = function (users_id, options, callback) {
  if (
    users_id &&
    Array.isArray(users_id) &&
    users_id.length > 0 &&
    users_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length == users_id.length
  ) {
    users_id = users_id.map((e) => {
      return new ObjectId(e);
    });
    User.deleteMany({ _id: users_id })
      .then((value) => {
        callback(null, value);
      })
      .catch((err) => {
        callback({
          msg: "Erreur mongo suppression.",
          type_error: "error-mongo",
        });
      });
  } else if (
    users_id &&
    Array.isArray(users_id) &&
    users_id.length > 0 &&
    users_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length != users_id.length
  ) {
    callback({
      msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.",
      type_error: "no-valid",
      fields: users_id.filter((e) => {
        return !mongoose.isValidObjectId(e);
      }),
    });
  } else if (users_id && !Array.isArray(users_id)) {
    callback({
      msg: "L'argement n'est pas un tableau.",
      type_error: "no-valid",
    });
  } else {
    callback({ msg: "Tableau non conforme.", type_error: "no-valid" });
  }
};
