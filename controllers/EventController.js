const EventService = require("../services/EventService");
const LoggerHttp = require("../utils/logger").http;
const passport = require("passport");

// La fonction permet d'ajouter un evenement
module.exports.addOneEvent = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Création d'un evenement");
  let opts = { populate: req.query.populate };
  EventService.addOneEvent(req.body, opts, function (err, value) {
    if (err && err.type_error == "no found") {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == "validator") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "duplicate") {
      res.statusCode = 405;
      res.send(err);
    } else {
      res.statusCode = 201;
      res.send(value);
    }
  });
};

// La fonction permet d'ajouter plusieurs evenements
module.exports.addManyEvents = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Création de plusieurs evenements");
  let options = { user: req.user };
  EventService.addManyEvents(req.body, options, function (err, value) {
    if (err) {
      res.statusCode = 405;
      res.send(err);
    } else {
      res.statusCode = 201;
      res.send(value);
    }
  });
};

// La fonction permet de chercher un evenement
module.exports.findOneEventById = function (req, res) {
  req.log.info("Recherche d'un evenement par son id");
  let opts = { populate: req.query.populate };

  EventService.findOneEventById(req.params.id, opts, function (err, value) {
    if (err && err.type_error == "no-found") {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == "no-valid") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de chercher plusieurs evenements
module.exports.findManyEventsById = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Recherche de plusieurs evenements", req.query.id);
  let arg = req.query.id;
  let opts = { populate: req.query.populate };
  if (arg && !Array.isArray(arg)) arg = [arg];

  EventService.findManyEventsById(arg, opts, function (err, value) {
    if (err && err.type_error == "no-found") {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == "no-valid") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de chercher un evenement par les champs autorisé
module.exports.findOneEvent = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Recherche d'un evenement par un champ autorisé");
  let fields = req.query.fields;
  let opts = { populate: req.query.populate };
  if (fields && !Array.isArray(fields)) fields = [fields];

  EventService.findOneEvent(
    fields,
    req.query.value,
    opts,
    function (err, value) {
      if (err && err.type_error == "no-found") {
        res.statusCode = 404;
        res.send(err);
      } else if (err && err.type_error == "no-valid") {
        res.statusCode = 405;
        res.send(err);
      } else if (err && err.type_error == "error-mongo") {
        res.statusCode = 500;
        res.send(err);
      } else {
        res.statusCode = 200;
        res.send(value);
      }
    }
  );
};

// La fonction permet de chercher plusieurs evenements
module.exports.findManyEvents = function (req, res) {
  req.log.info("Recherche de plusieurs événements");

  let page = req.query.page;
  let pageSize = req.query.pageSize;
  let opts = { populate: req.query.populate };

  let search = {};
  if (req.query.type) search.type = req.query.type;
  if (req.query.level) search.level = req.query.level;
  if (req.query.categorie) search.categorie = req.query.categorie;
  if (req.query.user) search.user = req.query.user;

  EventService.findManyEvents(
    search,
    pageSize,
    page,
    opts,
    function (err, value) {
      if (err && err.type_error === "no-valid") {
        res.status(405).send(err);
      } else if (err && err.type_error === "error-mongo") {
        res.status(500).send(err);
      } else {
        res.status(200).send(value);
      }
    }
  );
};

// La fonction permet de modifier un evenement
module.exports.updateOneEvent = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Modification d'un evenement");
  let update = req.body;
  let options = { user: req.user };

  EventService.updateOneEvent(
    req.params.id,
    update,
    options,
    function (err, value) {
      if (err && err.type_error == "no-found") {
        res.statusCode = 404;
        res.send(err);
      } else if (
        err &&
        (err.type_error == "no-valid" ||
          err.type_error == "validator" ||
          err.type_error == "duplicate")
      ) {
        res.statusCode = 405;
        res.send(err);
      } else if (err && err.type_error == "error-mongo") {
        res.statusCode = 500;
      } else {
        res.statusCode = 200;
        res.send(value);
      }
    }
  );
};

// La fonction permet de modifier plusieurs evenements
module.exports.updateManyEvents = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Modification de plusieurs evenements");
  var arg = req.query.id;
  let options = { user: req.user };
  if (arg && !Array.isArray(arg)) arg = [arg];
  var updateData = req.body;

  EventService.updateManyEvents(
    arg,
    updateData,
    options,
    function (err, value) {
      if (err && err.type_error == "no-found") {
        res.statusCode = 404;
        res.send(err);
      } else if (
        err &&
        (err.type_error == "no-valid" ||
          err.type_error == "validator" ||
          err.type_error == "duplicate")
      ) {
        res.statusCode = 405;
        res.send(err);
      } else if (err && err.type_error == "error-mongo") {
        res.statusCode = 500;
      } else {
        res.statusCode = 200;
        res.send(value);
      }
    }
  );
};

// La fonction permet de supprimer un evenement
module.exports.deleteOneEvent = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Suppression d'un evenement");
  EventService.deleteOneEvent(req.params.id, null, function (err, value) {
    if (err && err.type_error == "no-found") {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == "no-valid") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de supprimer plusieurs evenements
module.exports.deleteManyEvents = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Suppression de plusieurs evenements");
  var arg = req.query.id;
  if (arg && !Array.isArray(arg)) arg = [arg];
  EventService.deleteManyEvents(arg, null, function (err, value) {
    if (err && err.type_error == "no-found") {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == "no-valid") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500;
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

module.exports.addEventCandidate = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Adding candidate to event");

  const event_id = req.query.event_id;
  const candidate_id = req.query.candidate_id;
  const options = { user: req.user };

  EventService.addEventCandidate(
    event_id,
    candidate_id,
    options,
    function (err, value) {
      if (err && err.type_error === "no-found") {
        res.status(404).json(err);
      } else if (
        err &&
        (err.type_error === "no-valid" ||
          err.type_error === "validator" ||
          err.type_error === "duplicate")
      ) {
        res.status(405).json(err);
      } else if (err && err.type_error === "error-mongo") {
        res.status(500).json(err);
      } else {
        res.status(200).json(value);
      }
    }
  );
};

module.exports.deleteEventCandidate = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Removing candidate from event");

  const event_id = req.query.event_id;
  const candidate_id = req.query.candidate_id;
  const options = { user: req.user };

  EventService.deleteEventCandidate(
    event_id,
    candidate_id,
    options,
    function (err, value) {
      if (err && err.type_error === "no-found") {
        res.status(404).json(err);
      } else if (
        err &&
        (err.type_error === "no-valid" ||
          err.type_error === "validator" ||
          err.type_error === "duplicate" ||
          err.type_error === "not-in-event")
      ) {
        res.status(405).json(err);
      } else if (err && err.type_error === "error-mongo") {
        res.status(500).json(err);
      } else {
        res.status(200).json(value);
      }
    }
  );
};
