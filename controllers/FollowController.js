const FollowService = require("../services/FollowService");

module.exports.follow = function (req, res) {
  req.log.info("Un utilisateur a été follow");
  let follow = req.query.follow_id;
  FollowService.follow(req.params.id, follow, null, function (err, value) {
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

module.exports.unfollow = function (req, res) {
  req.log.info("Un utilisateur a été unfollow");
  let unfollow = req.query.unfollow_id;
  FollowService.unfollow(req.params.id, unfollow, null, function (err, value) {
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
