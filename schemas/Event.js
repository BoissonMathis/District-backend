const mongoose = require("mongoose");
const { updateCompletedStatus } = require("../middlewares/eventCompleted");

var EventSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  categorie: String,
  level: String,
  contentText: {
    type: String,
    required: true,
  },
  place: String,
  candidate: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  candidate_validate: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  slots: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value <= 12;
      },
      message: (props) =>
        `Slots must be less than or equal to 12. You entered ${props.value}.`,
    },
  },
  completed: {
    type: Boolean,
    required: true,
    default: false,
  },
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

EventSchema.pre("save", updateCompletedStatus);

module.exports = EventSchema;
