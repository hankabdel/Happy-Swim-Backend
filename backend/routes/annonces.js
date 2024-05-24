var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const Annonce = require("../models/annonces");

router.post("/add", (req, res) => {
  if (
    !checkBody(req.body, [
      "titre",
      "description",
      "adresse",
      "personne",
      "prix",
      // "image",
    ])
  ) {
    res.json({ result: false, error: "Champs manquants ou vides" });
    return;
  }

  const newAnnonce = new Annonce({
    titre: req.body.titre,
    description: req.body.description,
    personne: req.body.personne,
    prix: req.body.prix,
    image: req.body.image,
    userId: req.body.userId,
  });

  newAnnonce.save().then((data) => {
    res.json({ result: true, userID: data.userID });
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

router.get("/:_id", (res, req) => {
  console.log("hello");
  const id = req.params.id;
  Annonce.findOne({ _id: id }).then((data) => {
    res.json({ result: true, annonce: data });
  });
});

router.delete("/:_id", async (req, res) => {
  const id = req.params._id;

  try {
    const deletedDoc = await Annonce.deleteOne({ _id: id });
    console.log("Deleted Document Info:", deletedDoc);

    if (deletedDoc && deletedDoc.deletedCount > 0) {
      const data = await Annonce.find();
      console.log("Remaining Annonces:", data);
      res.json({ result: true, annonces: data });
    } else {
      res.status(404).json({ result: false, error: "Annonce non trouvée" });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'annonce:", error);
    res.status(500).json({ result: false, error: "Erreur interne du serveur" });
  }
});

module.exports = router;
