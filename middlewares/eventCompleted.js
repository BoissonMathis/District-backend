module.exports.updateCompletedStatus = function (next) {
  if (this.candidate_validate.length >= this.slots) {
    this.completed = true;
  } else {
    this.completed = false;
  }
  next();
};
