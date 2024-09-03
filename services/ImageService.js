const UserSchema = require("../schemas/User");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

var User = mongoose.model("User", UserSchema);

module.exports.updateProfilePicture = async function (userId, picture) {
  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return {
        error: { message: "User not found." },
        statusCode: 404,
      };
    }

    const oldPicturePath = currentUser.profil_image;
    const newPicturePath = `http://localhost:3000/data${picture}`;

    currentUser.profil_image = newPicturePath;
    await currentUser.save();

    if (
      oldPicturePath &&
      oldPicturePath.startsWith("http://localhost:3000/data/")
    ) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        oldPicturePath.replace("http://localhost:3000", ".")
      );

      fs.access(oldImagePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error(
                `Failed to delete old image at ${oldImagePath}: ${err.message}`
              );
            } else {
              console.log(`Successfully deleted old image at ${oldImagePath}`);
            }
          });
        } else {
          console.error(`Old image not found at ${oldImagePath}`);
        }
      });
    }

    return { user: currentUser.toObject() };
  } catch (error) {
    return {
      error: { message: error.message },
      statusCode: 500,
    };
  }
};

module.exports.updateBannerPicture = async (userId, picture) => {
  try {
    // Rechercher l'utilisateur actuel
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return {
        error: { message: "User not found." },
        statusCode: 404,
      };
    }

    // Conserver l'ancien chemin de l'image de bannière
    const oldPicturePath = currentUser.banner_image;
    const newPicturePath = `http://localhost:3000/data${picture}`;

    // Mettre à jour l'utilisateur avec le nouveau chemin d'image
    currentUser.banner_image = newPicturePath;
    await currentUser.save();

    // Si une ancienne image existe, supprimer l'ancienne image
    if (
      oldPicturePath &&
      oldPicturePath.startsWith("http://localhost:3000/data/")
    ) {
      // Construire le chemin absolu de l'ancienne image
      const oldImagePath = path.join(
        __dirname,
        "..", // Monter d'un niveau pour sortir du répertoire 'services'
        oldPicturePath.replace("http://localhost:3000", ".") // Remplacer l'URL par le chemin relatif
      );

      // Log du chemin de l'ancienne image
      console.log(`Attempting to delete old image at: ${oldImagePath}`);

      // Vérifier si l'ancien fichier existe et le supprimer
      fs.access(oldImagePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error(
                `Failed to delete old image at ${oldImagePath}: ${err.message}`
              );
            } else {
              console.log(`Successfully deleted old image at ${oldImagePath}`);
            }
          });
        } else {
          console.error(`Old image not found at ${oldImagePath}`);
        }
      });
    }

    return { user: currentUser.toObject() };
  } catch (error) {
    return {
      error: { message: error.message },
      statusCode: 500,
    };
  }
};
