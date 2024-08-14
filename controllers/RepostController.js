const RepostService = require("../services/RepostService");

module.exports.repost = function (req, res) {
  req.log.info("Un post a été repost");
  let post = req.query.post_id;
  RepostService.repost(req.params.id, post, null, function (err, value) {
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

module.exports.cancelrepost = function (req, res) {
  req.log.info("Un repost a été annulé");
  let post = req.query.post_id;
  RepostService.cancelrepost(req.params.id, post, null, function (err, value) {
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
