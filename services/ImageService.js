const UserSchema = require("../schemas/User");
const PostSchema = require("../schemas/Post");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

let User = mongoose.model("User", UserSchema);
let Post = mongoose.model("Post", PostSchema);

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
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return {
        error: { message: "User not found." },
        statusCode: 404,
      };
    }

    const oldPicturePath = currentUser.banner_image;
    const newPicturePath = `http://localhost:3000/data${picture}`;

    currentUser.banner_image = newPicturePath;
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

      console.log(`Attempting to delete old image at: ${oldImagePath}`);

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

module.exports.updatePostImage = async (postId, picture) => {
  try {
    console.log(
      `Tentative de mise à jour de l'image du post avec l'ID: ${postId}`
    );
    const currentPost = await Post.findById(postId);
    if (!currentPost) {
      console.error("Post non trouvé");
      return {
        error: { message: "Post not found." },
        statusCode: 404,
      };
    }

    console.log(`Post trouvé : ${JSON.stringify(currentPost)}`);
    const oldPicturePath = currentPost.contentImage;
    const newPicturePath = `http://localhost:3000/data${picture}`;
    console.log(`Nouvelle image : ${newPicturePath}`);

    currentPost.contentImage = newPicturePath;
    await currentPost.save();
    console.log(`Post mis à jour avec la nouvelle image : ${newPicturePath}`);

    if (
      oldPicturePath &&
      oldPicturePath.startsWith("http://localhost:3000/data/")
    ) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        oldPicturePath.replace("http://localhost:3000", ".")
      );

      console.log(
        `Tentative de suppression de l'ancienne image : ${oldImagePath}`
      );

      fs.access(oldImagePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error(
                `Échec de la suppression de l'ancienne image à ${oldImagePath}: ${err.message}`
              );
            } else {
              console.log(
                `Ancienne image supprimée avec succès : ${oldImagePath}`
              );
            }
          });
        } else {
          console.error(`Ancienne image non trouvée à ${oldImagePath}`);
        }
      });
    }

    return { post: currentPost.toObject() };
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour de l'image du post: ${error.message}`
    );
    return {
      error: { message: error.message },
      statusCode: 500,
    };
  }
};
