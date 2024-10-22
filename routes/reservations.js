var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const Annonce = require("../models/annonces");
const User = require("../models/users");
const Reservation = require("../models/reservations");

// Route pour ajouter une nouvelle réservation
router.post("/", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const annonceId = req.body.annonceId;

  // Vérification du token
  if (!token) {
    return res.status(400).json({ result: false, error: "Token manquant" });
  }
  console.log("------>Token", token); // Log pour voir le token

  // Vérification des champs obligatoires
  if (
    !checkBody(req.body, [
      "date",
      "heureDebut",
      "heureFin",
      "personne",
      "prix",
      "ville",
      "titre",
      "annonceId",
    ])
  ) {
    return res
      .status(400)
      .json({ result: false, error: "Champs manquants ou vides" });
  }

  try {
    // Recherche de l'utilisateur et de l'annonce
    const user = await User.findOne({ token: token });
    console.log("Tokenfindone----->", token); // Ajoutez ceci pour voir le token envoyé
    const annonce = await Annonce.findById({ _id: annonceId });
    console.log("User trouvé:", user); // Log pour voir si l'utilisateur a été trouvé

    if (!user || !annonce) {
      console.log(annonce, "hello annonce");
      console.log(user, "hello user");

      return res.status(404).json({
        result: false,
        error: "Utilisateur ou annonce non trouvé ou non autorisé",
      });
    }

    // Création de la nouvelle réservation
    const newReservation = new Reservation({
      titre,
      date,
      heureDebut,
      heureFin,
      personne,
      ville,
      prix,
      annonceId,
      userId: user._id,
    });

    // Sauvegarde de la réservation
    const savedReservation = await newReservation.save();
    return res.status(201).json({ result: true, data: savedReservation });
  } catch (error) {
    // Gestion des erreurs
    return res.status(500).json({ result: false, error: error.message });
  }
});

// Route pour récupérer les réservations de l'utilisateur connecté
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

// Route pour supprimer une réservation
router.delete("/:id", async (req, res) => {
  try {
    // Recherche et suppression de la réservation par ID et userId
    const deletedReservation = await Reservation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deletedReservation) {
      return res.json({
        result: false,
        error: "Réservation non trouvée ou non autorisée",
      });
    }

    res.json({ result: true, data: deletedReservation });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

module.exports = router;
