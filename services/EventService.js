const EventSchema = require("../schemas/Event");
const _ = require("lodash");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { Types } = mongoose;

let Event = mongoose.model("Event", EventSchema);

Event.createIndexes();

module.exports.addOneEvent = async function (event, options, callback) {
  let opts = {
    populate:
      options && options.populate
        ? [{ path: "user", select: "-token -password" }]
        : [],
  };
  try {
    var new_event = new Event(event);
    var errors = new_event.validateSync();

    if (errors) {
      errors = errors["errors"];
      var text = Object.keys(errors)
        .map((e) => {
          return errors[e]["properties"]
            ? errors[e]["properties"]["message"]
            : errors[e]["reason"];
        })
        .join(" ");
      var fields = _.transform(
        Object.keys(errors),
        function (result, value) {
          result[value] = errors[value]["properties"]
            ? errors[value]["properties"]["message"]
            : String(errors[value]["reason"]);
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
    } else {
      await new_event.save();
      Event.findById(new_event._id, null, opts)
        .then((value) => {
          try {
            if (value) {
              callback(null, value.toObject());
            } else {
              callback({
                msg: "Aucun evenement trouvé.",
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
      // callback(null, new_event.toObject());
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

module.exports.addManyEvents = async function (events, options, callback) {
  var errors = [];
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    event.user_id = options && options.user ? options.user._id : event.user_id;
    var new_event = new Event(event);
    var error = new_event.validateSync();
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
      const data = await Event.insertMany(events, { ordered: false });
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

module.exports.findOneEventById = function (event_id, options, callback) {
  let opts = {
    populate: [],
  };

  if (options && options.populate) {
    opts.populate.push(
      { path: "user", select: "-token -password" },
      { path: "candidate", select: "-password -token" },
      { path: "candidate_validate", select: "-password -token" }
    );
  }

  if (event_id && mongoose.isValidObjectId(event_id)) {
    Event.findById(event_id, null, opts)
      .then((value) => {
        try {
          if (value) {
            callback(null, value.toObject());
          } else {
            callback({
              msg: "Aucun événement trouvé.",
              type_error: "no-found",
            });
          }
        } catch (e) {
          console.log(e);
          callback({
            msg: "Erreur lors du traitement de l'événement.",
            type_error: "internal-error",
          });
        }
      })
      .catch((err) => {
        callback({
          msg: "Impossible de chercher l'événement.",
          type_error: "error-mongo",
        });
      });
  } else {
    callback({ msg: "ObjectId non conforme.", type_error: "no-valid" });
  }
};

module.exports.findManyEventsById = function (events_id, options, callback) {
  let opts = {
    populate:
      options && options.populate
        ? [{ path: "user", select: "-token -password" }]
        : [],
    lean: true,
  };

  if (
    events_id &&
    Array.isArray(events_id) &&
    events_id.length > 0 &&
    events_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length == events_id.length
  ) {
    events_id = events_id.map((e) => {
      return new ObjectId(e);
    });
    Event.find({ _id: events_id }, null, opts)
      .then((value) => {
        try {
          if (value && Array.isArray(value) && value.length != 0) {
            callback(null, value);
          } else {
            callback({
              msg: "Aucun evenement trouvé.",
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
    events_id &&
    Array.isArray(events_id) &&
    events_id.length > 0 &&
    events_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length != events_id.length
  ) {
    callback({
      msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.",
      type_error: "no-valid",
      fields: events_id.filter((e) => {
        return !mongoose.isValidObjectId(e);
      }),
    });
  } else if (events_id && !Array.isArray(events_id)) {
    callback({
      msg: "L'argument n'est pas un tableau.",
      type_error: "no-valid",
    });
  } else {
    callback({ msg: "Tableau non conforme.", type_error: "no-valid" });
  }
};

module.exports.findOneEvent = function (tab_field, value, options, callback) {
  // Options de population pour les références dans le schéma
  let opts = {
    populate: [],
  };

  if (options && options.populate) {
    opts.populate.push(
      { path: "user", select: "-token -password" }, // Populate du champ user
      { path: "candidate", select: "-password -token" }, // Populate du tableau candidate
      { path: "candidate_validate", select: "-password -token" } // Populate du tableau candidate_validate
    );
  }

  var field_unique = ["user", "level", "categorie", "type"];

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

    Event.findOne({ $or: obj_find }, null, opts)
      .then((value) => {
        if (value) {
          callback(null, value.toObject());
        } else {
          callback({ msg: "Événement non trouvé.", type_error: "no-found" });
        }
      })
      .catch((err) => {
        callback({ msg: "Erreur interne MongoDB", type_error: "error-mongo" });
      });
  } else {
    let msg = "";
    if (!tab_field || !Array.isArray(tab_field)) {
      msg += "Les champs de recherche sont incorrects.";
    }
    if (!value) {
      msg += msg
        ? " Et la valeur de recherche est vide."
        : "La valeur de recherche est vide.";
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
          )}) ne sont pas des champs de recherche autorisés.`
        : `Les champs (${field_not_authorized.join(
            ","
          )}) ne sont pas des champs de recherche autorisés.`;
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

module.exports.findManyEvents = function (
  search,
  limit,
  page,
  options,
  callback
) {
  let populate =
    options && options.populate
      ? [{ path: "user", select: "-token -password" }]
      : [];
  page = !page ? 1 : parseInt(page);
  limit = !limit ? 10 : parseInt(limit);
  console.log(search, limit, page);

  const allowedFields = ["user", "level", "categorie", "type"];

  if (
    typeof page !== "number" ||
    typeof limit !== "number" ||
    isNaN(page) ||
    isNaN(limit)
  ) {
    return callback({
      msg: `format de ${
        typeof page !== "number" ? "page" : "limit"
      } est incorrect`,
      type_error: "no-valid",
    });
  }

  let query_mongo = {};

  for (let field in search) {
    if (allowedFields.includes(field)) {
      if (field === "user") {
        if (Types.ObjectId.isValid(search[field])) {
          query_mongo[field] = new Types.ObjectId(search[field]);
        } else {
          return callback({
            msg: `La valeur de recherche pour '${field}' n'est pas un id valide`,
            type_error: "no-valid",
          });
        }
      } else {
        query_mongo[field] = { $regex: search[field], $options: "i" };
      }
    } else {
      console.log("ICII", field);
      return callback({
        msg: `Le champ '${field}' n'est pas un champ de recherche autorisé.`,
        type_error: "no-valid",
      });
    }
  }

  Event.countDocuments(query_mongo)
    .then((count) => {
      if (count > 0) {
        const skip = (page - 1) * limit;
        Event.find(query_mongo, null, { skip: skip, limit: limit, lean: true })
          .populate(populate)
          .then((results) => {
            callback(null, { count: count, results: results });
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(null, { count: 0, results: [] });
      }
    })
    .catch((err) => {
      callback(err);
    });
};

module.exports.updateOneEvent = function (event_id, update, options, callback) {
  update.user = options && options.user ? options.user._id : update.user;
  update.updated_at = new Date();

  if (event_id && mongoose.isValidObjectId(event_id)) {
    Event.findByIdAndUpdate(new ObjectId(event_id), update, {
      returnDocument: "after",
      runValidators: true,
    })
      .then((value) => {
        try {
          if (value) callback(null, value.toObject());
          else
            callback({ msg: "Evenement non trouvé.", type_error: "no-found" });
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
    callback({
      msg: "Id invalide.",
      type_error: "no-valid",
    });
  }
};

module.exports.updateManyEvents = function (
  events_id,
  update,
  options,
  callback
) {
  update.user = options && options.user ? options.user._id : update.user;

  if (
    events_id &&
    Array.isArray(events_id) &&
    events_id.length > 0 &&
    events_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length == events_id.length
  ) {
    events_id = events_id.map((e) => {
      return new ObjectId(e);
    });
    Event.updateMany({ _id: events_id }, update, { runValidators: true })
      .then((value) => {
        try {
          if (value && value.matchedCount != 0) {
            callback(null, value);
          } else {
            callback({ msg: "Evenement non trouvé", type_error: "no-found" });
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
    callback({ msg: "Id's invalide.", type_error: "no-valid" });
  }
};

module.exports.deleteOneEvent = function (event_id, options, callback) {
  if (event_id && mongoose.isValidObjectId(event_id)) {
    Event.findByIdAndDelete(event_id)
      .then((value) => {
        try {
          if (value) callback(null, value.toObject());
          else
            callback({ msg: "Evenement non trouvé.", type_error: "no-found" });
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

module.exports.deleteManyEvents = function (events_id, options, callback) {
  let opts = options;

  if (
    events_id &&
    Array.isArray(events_id) &&
    events_id.length > 0 &&
    events_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length == events_id.length
  ) {
    events_id = events_id.map((e) => {
      return new ObjectId(e);
    });
    Event.deleteMany({ _id: events_id })
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
    events_id &&
    Array.isArray(events_id) &&
    events_id.length > 0 &&
    events_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length != events_id.length
  ) {
    callback({
      msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.",
      type_error: "no-valid",
      fields: events_id.filter((e) => {
        return !mongoose.isValidObjectId(e);
      }),
    });
  } else if (events_id && !Array.isArray(events_id)) {
    callback({
      msg: "L'argument n'est pas un tableau.",
      type_error: "no-valid",
    });
  } else {
    callback({ msg: "Tableau non conforme.", type_error: "no-valid" });
  }
};

module.exports.addEventCandidate = function (
  event_id,
  candidate_id,
  options,
  callback
) {
  if (
    !mongoose.isValidObjectId(event_id) ||
    !mongoose.isValidObjectId(candidate_id)
  ) {
    return callback({ msg: "Invalid ID.", type_error: "no-valid" });
  }

  Event.findById(event_id)
    .then((event) => {
      if (!event) {
        return callback({ msg: "Event not found.", type_error: "no-found" });
      }

      if (event.candidate.includes(candidate_id)) {
        return callback({
          msg: "Candidate already added.",
          type_error: "duplicate",
        });
      }

      event.candidate.push(candidate_id);
      event.updated_at = new Date();

      event
        .save()
        .then((updatedEvent) => {
          callback(null, updatedEvent.toObject());
        })
        .catch((err) => {
          if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            const duplicateErrors = {
              msg: `Duplicate key error: ${field} must be unique.`,
              fields_with_error: [field],
              fields: { [field]: `The ${field} is already taken.` },
              type_error: "duplicate",
            };
            callback(duplicateErrors);
          } else {
            err = err.errors;
            const text = Object.keys(err)
              .map((e) => err[e].properties.message)
              .join(" ");
            const fields = Object.keys(err).reduce((result, value) => {
              result[value] = err[value].properties.message;
              return result;
            }, {});
            const validationError = {
              msg: text,
              fields_with_error: Object.keys(err),
              fields: fields,
              type_error: "validator",
            };
            callback(validationError);
          }
        });
    })
    .catch((err) => {
      callback({ msg: "Internal server error.", type_error: "error-mongo" });
    });
};

module.exports.deleteEventCandidate = function (
  event_id,
  candidate_id,
  options,
  callback
) {
  if (
    !mongoose.isValidObjectId(event_id) ||
    !mongoose.isValidObjectId(candidate_id)
  ) {
    return callback({ msg: "Invalid ID.", type_error: "no-valid" });
  }

  Event.findById(event_id)
    .then((event) => {
      if (!event) {
        return callback({ msg: "Event not found.", type_error: "no-found" });
      }

      const candidateIndex = event.candidate.indexOf(candidate_id);
      if (candidateIndex === -1) {
        return callback({
          msg: "Candidate not found in the event.",
          type_error: "not-in-event",
        });
      }

      event.candidate.splice(candidateIndex, 1);
      event.updated_at = new Date();

      event
        .save()
        .then((updatedEvent) => {
          callback(null, updatedEvent.toObject());
        })
        .catch((err) => {
          if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            const duplicateErrors = {
              msg: `Duplicate key error: ${field} must be unique.`,
              fields_with_error: [field],
              fields: { [field]: `The ${field} is already taken.` },
              type_error: "duplicate",
            };
            callback(duplicateErrors);
          } else {
            err = err.errors;
            const text = Object.keys(err)
              .map((e) => err[e].properties.message)
              .join(" ");
            const fields = Object.keys(err).reduce((result, value) => {
              result[value] = err[value].properties.message;
              return result;
            }, {});
            const validationError = {
              msg: text,
              fields_with_error: Object.keys(err),
              fields: fields,
              type_error: "validator",
            };
            callback(validationError);
          }
        });
    })
    .catch((err) => {
      callback({ msg: "Internal server error.", type_error: "error-mongo" });
    });
};

module.exports.addEventCandidateValidate = function (
  event_id,
  candidate_id,
  options,
  callback
) {
  if (event_id && mongoose.isValidObjectId(event_id)) {
    Event.findById(event_id)
      .then((event) => {
        if (!event) {
          return callback({
            msg: "Evenement non trouvé.",
            type_error: "no-found",
          });
        }

        if (event.candidate_validate.includes(candidate_id)) {
          return callback({
            msg: "Le candidat est déjà validé pour cet événement.",
            type_error: "already-validated",
          });
        }

        event.candidate_validate.push(candidate_id);
        event.updated_at = new Date();

        return event.save();
      })
      .then((updatedEvent) => {
        if (updatedEvent) {
          callback(null, updatedEvent.toObject());
        } else {
          callback({
            msg: "Échec de la mise à jour de l'événement.",
            type_error: "update-failed",
          });
        }
      })
      .catch((errors) => {
        if (errors.code === 11000) {
          const field = Object.keys(errors.keyPattern)[0];
          const duplicateErrors = {
            msg: `Duplicate key error: ${field} must be unique.`,
            fields_with_error: [field],
            fields: { [field]: `The ${field} is already taken.` },
            type_error: "duplicate",
          };
          callback(duplicateErrors);
        } else {
          const err = {
            msg: errors.message || "Erreur de validation.",
            type_error: "validator",
          };
          callback(err);
        }
      });
  } else {
    callback({ msg: "Id invalide.", type_error: "no-valid" });
  }
};

module.exports.deleteEventCandidateValidate = function (
  event_id,
  candidate_id,
  options,
  callback
) {
  if (event_id && mongoose.isValidObjectId(event_id)) {
    Event.findById(event_id)
      .then((event) => {
        if (!event) {
          return callback({
            msg: "Événement non trouvé.",
            type_error: "no-found",
          });
        }

        const candidateIndex = event.candidate_validate.indexOf(candidate_id);
        if (candidateIndex === -1) {
          return callback({
            msg: "Le candidat n'est pas validé pour cet événement.",
            type_error: "not-validated",
          });
        }

        event.candidate_validate.splice(candidateIndex, 1);
        event.updated_at = new Date();

        return event.save();
      })
      .then((updatedEvent) => {
        if (updatedEvent) {
          callback(null, updatedEvent.toObject());
        } else {
          callback({
            msg: "Échec de la mise à jour de l'événement.",
            type_error: "update-failed",
          });
        }
      })
      .catch((errors) => {
        const err = {
          msg: errors.message || "Erreur de validation.",
          type_error: "validator",
        };
        callback(err);
      });
  } else {
    callback({ msg: "Id invalide.", type_error: "no-valid" });
  }
};

module.exports.deleteEventValidateCandidate = function () {};
