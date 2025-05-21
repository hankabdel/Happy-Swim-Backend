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

  // Vérifiez que le token est présent
  if (!token) {
    return res.status(401).json({
      result: false,
      error: "Token manquant",
    });
  }

  try {
    // Recherche de l'utilisateur par le token
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({
        result: false,
        error: "Utilisateur introuvable ou non autorisé",
      });
    }

    // Validation des champs obligatoires
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
      return res.status(400).json({
        result: false,
        error: "Champs obligatoires manquants",
      });
    }

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

    // Création d'une nouvelle réservation
    const newReservation = new Reservation({
      titre: req.body.titre,
      date: req.body.date,
      heureDebut: req.body.heureDebut,
      heureFin: req.body.heureFin,
      personne: req.body.personne,
      ville: req.body.ville,
      prix: req.body.prix,
      annonceId: req.body.annonceId,
      userId: user._id, // Associe l'utilisateur trouvé
    });

    const savedReservation = await newReservation.save();
    return res.status(201).json({ result: true, data: savedReservation });
  } catch (error) {
    console.error("Erreur lors de la création de la réservation :", error);
    return res.status(500).json({ result: false, error: error.message });
  }
});

// Route pour récupérer les réservations de l'utilisateur connecté
router.get("/", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // Vérifiez que le token est présent
  if (!token) {
    return res.status(401).json({ result: false, error: "Token manquant" });
  }

  try {
    // Recherche de l'utilisateur par le token
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({
        result: false,
        error: "Utilisateur introuvable ou non autorisé",
      });
    }

    // Recherche des réservations de l'utilisateur
    const reservations = await Reservation.find({ userId: user._id }).populate(
      "annonceId"
    );

    res.status(200).json({ result: true, data: reservations });
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations :", error);
    res.status(500).json({ result: false, error: error.message });
  }
});

// Route pour supprimer une réservation
router.delete("/:id", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // Vérifiez que le token est présent
  if (!token) {
    return res.status(401).json({ result: false, error: "Token manquant" });
  }

  try {
    // Recherche de l'utilisateur par le token
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({
        result: false,
        error: "Utilisateur introuvable ou non autorisé",
      });
    }

    // Suppression de la réservation associée à l'utilisateur
    const deletedReservation = await Reservation.findOneAndDelete({
      _id: req.params.id,
      userId: user._id, // Vérifie la réservation appartient bien à l'utilisateur
    });

    if (!deletedReservation) {
      return res.status(404).json({
        result: false,
        error: "Réservation introuvable ou non autorisée",
      });
    }

    res.status(200).json({ result: true, data: deletedReservation });
  } catch (error) {
    console.error("Erreur lors de la suppression de la réservation :", error);
    res.status(500).json({ result: false, error: error.message });
  }
});

module.exports = router;
