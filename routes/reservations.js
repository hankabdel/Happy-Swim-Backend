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

  // Vérification du token
  const user = await getUserFromToken(token);
  if (!user) {
    return res.status(401).json({
      result: false,
      error: "Token invalide ou utilisateur introuvable",
    });
  }

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
    // Recherche de l'annonce
    const annonce = await Annonce.findById(req.body.annonceId);
    if (!annonce) {
      return res
        .status(404)
        .json({ result: false, error: "Annonce introuvable" });
    }

    // Vérification des heures
    if (req.body.heureDebut >= req.body.heureFin) {
      return res.status(400).json({
        result: false,
        error: "L'heure de début doit être avant l'heure de fin",
      });
    }

    // Création de la réservation
    const newReservation = new Reservation({
      titre: req.body.titre,
      date: req.body.date,
      heureDebut: req.body.heureDebut,
      heureFin: req.body.heureFin,
      personne: req.body.personne,
      ville: req.body.ville,
      prix: req.body.prix,
      annonceId: req.body.annonceId,
      userId: user._id,
    });

    const savedReservation = await newReservation.save();
    return res.status(201).json({ result: true, data: savedReservation });
  } catch (error) {
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
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  try {
    // Vérification du token
    if (!token) {
      return res.status(400).json({ result: false, error: "Token manquant" });
    }

    // Recherche de l'utilisateur par token
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({
        result: false,
        error: "Utilisateur non trouvé ou non autorisé",
      });
    }

    // Recherche et suppression de la réservation par ID et userId
    const deletedReservation = await Reservation.findOneAndDelete({
      _id: req.params.id,
      userId: user._id,
    });

    if (!deletedReservation) {
      return res.status(404).json({
        result: false,
        error: "Réservation non trouvée ou non autorisée",
      });
    }

    res.json({ result: true, data: deletedReservation });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error); // Ajout d'un log pour déboguer
    res.status(500).json({ result: false, error: error.message });
  }
});

module.exports = router;
