const mongoose = require("mongoose");

var CommentSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  },
  contentText: {
    type: String,
    required: true,
  },
  contentImage: {
    type: String,
  },
  like: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  created_by: {
    type: String,
    required: true,
    default: function () {
      return this._id ? this._id.toString() : null;
    },
  },
  created_at: {
    type: String,
    default: new Date(),
  },
  updated_at: String,
});

module.exports = CommentSchema;
