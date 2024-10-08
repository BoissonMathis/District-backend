const CommentSchema = require("../schemas/Comment");
const _ = require("lodash");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { Types } = mongoose;

let Comment = mongoose.model("Comment", CommentSchema);

Comment.createIndexes();

function handleErrors(errors, callback) {
  if (errors.code === 11000) {
    const field = Object.keys(errors.keyPattern)[0];
    const duplicateErrors = {
      msg: `Duplicate key error: ${field} must be unique.`,
      fields_with_error: [field],
      index: errors.index,
      fields: { [field]: `The ${field} is already taken.` },
      type_error: "duplicate",
    };
    callback(duplicateErrors);
  } else {
    const errorDetails = errors.errors;
    const text = Object.keys(errorDetails)
      .map((e) => errorDetails[e].properties.message)
      .join(" ");
    const fields = _.transform(
      Object.keys(errorDetails),
      (result, value) => {
        result[value] = errorDetails[value].properties.message;
      },
      {}
    );
    const err = {
      msg: text,
      fields_with_error: Object.keys(errorDetails),
      fields: fields,
      type_error: "validator",
    };
    callback(err);
  }
}

module.exports.addOneComment = async function (comment, options, callback) {
  let opts = {
    populate: options && options.populate ? ["user"] : [],
  };
  try {
    var new_comment = new Comment(comment);
    var errors = new_comment.validateSync();

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
      await new_comment.save();
      new_comment.comment && opts.populate.push("comment");
      new_comment.post && opts.populate.push("post");
      Comment.findById(new_comment._id, null, opts)
        .then((value) => {
          try {
            if (value) {
              callback(null, value.toObject());
            } else {
              callback({
                msg: "Aucun commentaire trouvé.",
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
      var err = {
        msg: "Format de requete invalid",
        type_error: "validator",
      };
      callback(err);
    }
  }
};

module.exports.addManyComments = async function (comments, options, callback) {
  var errors = [];
  for (var i = 0; i < comments.length; i++) {
    var comment = comments[i];
    comment.user_id =
      options && options.user ? options.user._id : comment.user_id;
    var new_comment = new Comment(comment);
    var error = new_comment.validateSync();
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
      const data = await Comment.insertMany(comments, { ordered: false });
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
        callback(errors);
      }
    }
  }
};

module.exports.findOneCommentById = function (comment_id, options, callback) {
  let opts = { populate: options && options.populate ? ["user", "post"] : [] };

  if (comment_id && mongoose.isValidObjectId(comment_id)) {
    Comment.findById(comment_id, null, opts)
      .then((value) => {
        try {
          if (value) {
            callback(null, value.toObject());
          } else {
            callback({
              msg: "Aucun commentaire trouvé.",
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

module.exports.findManyCommentsById = function (
  comments_id,
  options,
  callback
) {
  let opts = {
    populate: options && options.populate ? ["user", "post"] : [],
    lean: true,
  };

  if (
    comments_id &&
    Array.isArray(comments_id) &&
    comments_id.length > 0 &&
    comments_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length == comments_id.length
  ) {
    comments_id = comments_id.map((e) => {
      return new ObjectId(e);
    });
    Comment.find({ _id: comments_id }, null, opts)
      .then((value) => {
        try {
          if (value && Array.isArray(value) && value.length != 0) {
            callback(null, value);
          } else {
            callback({ msg: "Aucun comment trouvé.", type_error: "no-found" });
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
    comments_id &&
    Array.isArray(comments_id) &&
    comments_id.length > 0 &&
    comments_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length != comments_id.length
  ) {
    callback({
      msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.",
      type_error: "no-valid",
      fields: comments_id.filter((e) => {
        return !mongoose.isValidObjectId(e);
      }),
    });
  } else if (comments_id && !Array.isArray(comments_id)) {
    callback({
      msg: "L'argument n'est pas un tableau.",
      type_error: "no-valid",
    });
  } else {
    callback({ msg: "Tableau non conforme.", type_error: "no-valid" });
  }
};

module.exports.findOneComment = function (tab_field, value, options, callback) {
  let opts = { populate: options && options.populate ? ["user"] : [] };
  var field_unique = ["user", "post", "answer"];

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
    Comment.findOne({ $or: obj_find }, null, opts)
      .then((value) => {
        if (value) {
          callback(null, value.toObject());
        } else {
          callback({ msg: "Commentaire non trouvé.", type_error: "no-found" });
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

module.exports.findManyComments = function (
  search,
  field,
  limit,
  page,
  options,
  callback
) {
  let populate = options && options.populate ? ["user", "post"] : [];
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
    let query_mongo = {};
    if (Types.ObjectId.isValid(search)) {
      query_mongo[field] = new Types.ObjectId(search);
    } else {
      return callback({
        msg: "La valeur de recherche n'est pas un ID valide.",
        type_error: "no-valid",
      });
    }
    Comment.countDocuments(query_mongo)
      .then((count) => {
        if (count > 0) {
          const skip = (page - 1) * limit;
          Comment.find(query_mongo, null, {
            skip: skip,
            limit: limit,
            lean: true,
          })
            .populate(populate)
            .then((results) => {
              callback(null, { count: count, page: page, results: results });
            })
            .catch((err) => {
              callback(err);
            });
        } else {
          callback(null, { count: 0, page: page, results: [] });
        }
      })
      .catch((err) => {
        callback(err);
      });
  }
};

module.exports.updateOneComment = function (
  comment_id,
  update,
  options,
  callback
) {
  update.user = options && options.user ? options.user._id : update.user;
  update.updated_at = new Date();

  if (comment_id && mongoose.isValidObjectId(comment_id)) {
    if (update.like && Array.isArray(update.like)) {
      const invalid_id = [];
      update.like.forEach((id) => {
        !Types.ObjectId.isValid(id) && invalid_id.push(id);
      });
      if (invalid_id.length > 0) {
        callback({
          msg: "Le tableau 'like' contient des ID non valides.",
          type_error: "no-valid",
        });
      }

      Comment.findById(comment_id)
        .then((comment) => {
          if (!comment) {
            callback({
              msg: "Commentaire non trouvé.",
              type_error: "no-found",
            });
          }
          comment.like = _.uniq([...comment.like, ...update.like]);
          comment.updated_at = new Date();

          comment
            .save()
            .then((savedComment) => {
              callback(null, savedComment.toObject());
            })
            .catch((errors) => handleErrors(errors, callback));
        })
        .catch((errors) => handleErrors(errors, callback));
    } else {
      Comment.findByIdAndUpdate(new ObjectId(comment_id), update, {
        returnDocument: "after",
        runValidators: true,
      })
        .then((value) => {
          try {
            if (value) {
              callback(null, value.toObject());
            } else {
              callback({
                msg: "Commentaire non trouvé.",
                type_error: "no-found",
              });
            }
          } catch (e) {
            callback(e);
          }
        })
        .catch((errors) => handleErrors(errors, callback));
    }
  } else {
    callback({ msg: "Id invalide.", type_error: "no-valid" });
  }
};

module.exports.updateManyComments = function (
  comments_id,
  update,
  options,
  callback
) {
  update.user = options && options.user ? options.user._id : update.user;

  if (
    comments_id &&
    Array.isArray(comments_id) &&
    comments_id.length > 0 &&
    comments_id.every(mongoose.isValidObjectId)
  ) {
    comments_id = comments_id.map((e) => new ObjectId(e));

    if (update.like && Array.isArray(update.like)) {
      let invalid_id = [];
      update.like.forEach((id, index) => {
        !Types.ObjectId.isValid(id) && invalid_id.push(id);
      });
      if (invalid_id.length > 0) {
        callback({
          msg: "Le tableau 'like' contient des ID non valides.",
          type_error: "no-valid",
        });
      }

      Comment.find({ _id: { $in: comments_id } })
        .then((comments) => {
          if (comments.length === 0) {
            return callback({
              msg: "Commentaires non trouvés",
              type_error: "no-found",
            });
          }

          comments.forEach((comment) => {
            comment.like = _.uniq([...comment.like, ...update.like]);
            comment.updated_at = new Date();
          });

          // Use bulk write to update all comments at once
          const bulkOps = comments.map((comment) => ({
            updateOne: {
              filter: { _id: comment._id },
              update: {
                like: comment.like,
                updated_at: comment.updated_at,
                user: update.user,
              },
            },
          }));

          Comment.bulkWrite(bulkOps)
            .then((result) => callback(null, result))
            .catch((errors) => handleErrors(errors, callback));
        })
        .catch((errors) => handleErrors(errors, callback));
    } else {
      Comment.updateMany({ _id: { $in: comments_id } }, update, {
        runValidators: true,
      })
        .then((value) => {
          try {
            if (value && value.matchedCount !== 0) {
              callback(null, value);
            } else {
              callback({
                msg: "Commentaires non trouvés",
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
    }
  } else {
    callback({ msg: "Id invalide.", type_error: "no-valid" });
  }
};

module.exports.deleteOneComment = function (comment_id, options, callback) {
  if (comment_id && mongoose.isValidObjectId(comment_id)) {
    Comment.findByIdAndDelete(comment_id)
      .then((value) => {
        try {
          if (value) callback(null, value.toObject());
          else
            callback({
              msg: "Commentaire non trouvé.",
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

module.exports.deleteManyComments = function (comments_id, options, callback) {
  let opts = options;

  if (
    comments_id &&
    Array.isArray(comments_id) &&
    comments_id.length > 0 &&
    comments_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length == comments_id.length
  ) {
    comments_id = comments_id.map((e) => {
      return new ObjectId(e);
    });
    Comment.deleteMany({ _id: comments_id })
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
    comments_id &&
    Array.isArray(comments_id) &&
    comments_id.length > 0 &&
    comments_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length != comments_id.length
  ) {
    callback({
      msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.",
      type_error: "no-valid",
      fields: comments_id.filter((e) => {
        return !mongoose.isValidObjectId(e);
      }),
    });
  } else if (comments_id && !Array.isArray(comments_id)) {
    callback({
      msg: "L'argement n'est pas un tableau.",
      type_error: "no-valid",
    });
  } else {
    callback({ msg: "Tableau non conforme.", type_error: "no-valid" });
  }
};
