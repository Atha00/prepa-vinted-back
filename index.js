require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const Offer = require("./models/Offer");
const app = express();

mongoose.connect(process.env.MONGODB_URI);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_PUBLIC,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json());

app.get("/", (req, res) => {
  try {
    return res.status(200).json("Bienvenue sur l'API Vinted !");
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.get("/offers", async (req, res) => {
  try {
    const offers = await Offer.find()
      .select("product_name product_price -_id")
      .sort({ product_price: 1 })
      .limit(5)
      .skip(15);

    return res.status(200).json(offers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.all("*", (req, res) => {
  return res.status(404).json("Not found");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
