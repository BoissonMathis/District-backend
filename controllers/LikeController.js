const LikeService = require("../services/LikeService");

module.exports.like = function (req, res) {
  req.log.info("Un post a été like");
  let post = req.query.post_id;
  LikeService.like(req.params.id, post, null, function (err, value) {
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

module.exports.dislike = function (req, res) {
  req.log.info("Un post a été dislike");
  let post = req.query.post_id;
  LikeService.dislike(req.params.id, post, null, function (err, value) {
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
