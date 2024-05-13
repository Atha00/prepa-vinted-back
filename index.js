require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/prepa-vinted");

const Offer = require("./models/Offer");
const User = require("./models/User");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

app.get("/", (req, res) => {
  try {
    return res.status(200).json("Bienvenue sur notre serveur Vinted !");
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

const userRoutes = require("./routes/user");
app.use(userRoutes);

app.post("/offer/publish", fileUpload(), async (req, res) => {
  try {
    console.log(req.headers.authorization);
    const token = req.headers.authorization.replace("Bearer ", "");

    const user = await User.findOne({
      token: token,
    });
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      console.log(req.body);
      // const convertedPicture = convertToBase64(req.files.picture);
      // console.log(convertedPicture);
      // const uploadResponse = await cloudinary.uploader.upload(convertedPicture);
      // console.log(uploadResponse);
      const newOffer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: Number(req.body.price),
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
        // product_image: uploadResponse,
        owner: user,
      });
      await newOffer.save();
      return res.status(200).json(newOffer);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get("/offers", async (req, res) => {
  try {
    // const offers = await Offer.find({
    //   product_name: new RegExp("Pantalon", "i"),
    // }).select("product_name product_price -_id");
    // const offers = await Offer.find({
    //   product_price: { $lte: 100, $gte: 50 },
    // }).select("product_name product_price -_id");
    const offers = await Offer.find()
      .sort({ product_price: -1 })
      .skip(0)
      .limit(5)
      .select("product_name product_price -_id");
    return res.status(200).json(offers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.all("*", (req, res) => {
  return res.status(404).json("Vous vous êtes perdu 👀");
});

app.listen(process.env.PORT, () => {
  console.log("Server started 🔥🔥🔥🔥");
});
