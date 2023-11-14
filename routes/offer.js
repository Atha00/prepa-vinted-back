const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const isAuthenticated = require("../middlewares/isAuthenticated");
const Offer = require("../models/Offer");

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      // const ownerToken = req.headers.authorization.replace("Bearer ", "");
      // const owner = await User.findOne({ token: ownerToken });
      // console.log(owner);

      // console.log("body =>", req.body);
      const newOffer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          {
            MARQUE: req.body.brand,
          },
          {
            TAILLE: req.body.size,
          },
          {
            ÉTAT: req.body.condition,
          },
          {
            COULEUR: req.body.color,
          },
          {
            EMPLACEMENT: req.body.city,
          },
        ],
        owner: req.user,
      });
      console.log("offer =>", newOffer);
      console.log(req.files);

      // mise en place de l'upload : seulement si on a quelque chose dans req.files.picture :
      if (req.files) {
        const convertedPicture = convertToBase64(req.files.picture);

        const uploadResult = await cloudinary.uploader.upload(
          convertedPicture,
          {
            folder: `/test/offers/${newOffer._id}`,
          }
        );
        newOffer.product_image = uploadResult;
      }

      await newOffer.save();
      // console.log("file to upload =>", convertedPicture);
      return res.status(201).json(newOffer);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
