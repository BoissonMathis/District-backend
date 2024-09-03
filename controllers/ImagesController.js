const PictureService = require("../services/ImageService");
const LoggerHttp = require("../utils/logger").http;

module.exports.updateProfilePicture = async function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Updating user profile picture");

  const userId = req.query.user_id;
  const picture = req.file ? `/images/${req.file.filename}` : null;

  if (!picture) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    const result = await PictureService.updateProfilePicture(userId, picture);

    if (result.error) {
      const { statusCode, error } = result;
      res.status(statusCode).json(error);
    } else {
      res.status(200).json({
        message: "Profile picture updated successfully.",
        user: result.user,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateBannerPicture = async (req, res) => {
  LoggerHttp(req, res);
  req.log.info("Updating user banner picture");

  const userId = req.query.user_id;
  const picture = req.file ? `/images/${req.file.filename}` : null;

  if (!picture) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    const result = await PictureService.updateBannerPicture(userId, picture);

    if (result.error) {
      const { statusCode, error } = result;
      res.status(statusCode).json(error);
    } else {
      res.status(200).json({
        message: "Banner picture updated successfully.",
        user: result.user,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
