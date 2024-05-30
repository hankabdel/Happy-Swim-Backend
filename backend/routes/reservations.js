var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const Annonce = require("../models/annonces");
const User = require("../models/users");
const Reservation = require("../models/reservations");

router.post("/addResa", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const annonceId = req.body.annonceId;

  if (!token) {
    res.json({ result: false, error: "Token manquant" });
    return;
  }

  if (
    !checkBody(req.body, ["date", "heureDebut", "heureFin", "personne", "prix"])
  ) {
    res.json({ result: false, error: "Champs manquants ou vides" });
    return;
  }
  const user = await User.findOne({ token: token });
  const annonce = await Annonce.findById({ _id: annonceId });

  if (!user || !annonce) {
    res.json({
      result: false,
      error: "Utilisateur ou annonce non trouvé ou non autorisé",
    });
    return;
  }

  const newReservation = new Reservation({
    titre: req.body.titre,
    date: req.body.date,
    heureDebut: req.body.heureDebut,
    heureFin: req.body.heureFin,
    personne: req.body.personne,
    ville: req.body.ville,
    prix: req.body.prix,
    annonceId: annonceId,
    userId: user._id,
  });

  newReservation
    .save()
    .then((data) => {
      res.json({ result: true, data: data });
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
    });
});

router.get("/", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  const user = await User.findOne({ token: token });

  if (!user) {
    res.json({ result: false, error: "Utilisateur non trouvé" });
    return;
  }

  Reservation.find({ userId: user._id })
    .populate("annonceId")
    .then((reservations) => {
      res.json({ result: true, data: reservations });
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
    });
});

module.exports = router;
