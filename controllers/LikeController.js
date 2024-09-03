const LikeService = require("../services/LikeService");

module.exports.like = function (req, res) {
  req.log.info("Un élément a été like");

  const itemId = req.query.item_id;
  const type = req.query.type;

  if (!itemId || !type) {
    res.statusCode = 405;
    return res.send({
      msg: "item_id et type sont requis.",
      type_error: "no-valid",
    });
  }

  LikeService.like(req.params.id, itemId, type, null, function (err, value) {
    if (err && err.type_error === "no-found") {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error === "no-valid") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error === "error-mongo") {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

module.exports.dislike = function (req, res) {
  req.log.info("Un élément a été dislike");

  const item_id = req.query.item_id;
  const type = req.query.type;

  if (!item_id || !type) {
    res.statusCode = 400;
    return res.send({
      msg: "item_id et type sont requis.",
      type_error: "no-valid",
    });
  }

  LikeService.dislike(
    req.params.id,
    item_id,
    type,
    null,
    function (err, value) {
      if (err && err.type_error === "no-found") {
        res.statusCode = 404;
        res.send(err);
      } else if (err && err.type_error === "no-valid") {
        res.statusCode = 405;
        res.send(err);
      } else if (err && err.type_error === "error-mongo") {
        res.statusCode = 500;
        res.send(err);
      } else {
        res.statusCode = 200;
        res.send(value);
      }
    }
  );
};
