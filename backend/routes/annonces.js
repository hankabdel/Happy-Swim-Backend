var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const Annonce = require("../models/annonces");
const User = require("../models/users");

router.post("/add", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (
    !checkBody(req.body, [
      "titre",
      "description",
      "ville",
      "personne",
      "prix",
      // "image",
    ])
  ) {
    res.json({ result: false, error: "Champs manquants ou vides" });
    return;
  }
  //interroger la BDD
  //Chercher id de l'utilisateur
  //relier l'id utilisateur à l'annonce

  const user = await User.findOne({ token: token });

  const newAnnonce = new Annonce({
    titre: req.body.titre,
    description: req.body.description,
    personne: req.body.personne,
    ville: req.body.ville,
    prix: req.body.prix,
    // image: req.body.image,
    userId: user._id,
  });

  newAnnonce.save().then((data) => {
    res.json({ result: true, data: data });
  });
});

router.get("/recover", (req, res) => {
  Annonce.find()
    .then((data) => {
      res.json({ result: true, data: data });
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
    });
});

router.delete("/delete", async (req, res) => {
  //comparer token
  //recuper userID
  //chercher dans Annoce avec userID
  //si true je supprime

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  const user = await User.findOne({ token: token });
  console.log("USER", user._id);

  const annonce = await Annonce.findOne({ userId: user._id });
  if (annonce) {
    await Annonce.deleteOne({ _id: annonce._id });

    res.json({
      result: true,
      message: "Annonce supprimée",
      // annonceId: annonce._id,
    });
  }
});

//mesAnnonce:

router.get("/mesAnnonces", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  const user = await User.findOne({ token: token });

  if (!user) {
    res.json({ result: false, error: "Utilisateur non trouvé" });
    return;
  }

  Annonce.find({ userId: user._id })
    .then((annonces) => {
      res.json({ result: true, data: annonces });
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
    });
});

module.exports = router;
