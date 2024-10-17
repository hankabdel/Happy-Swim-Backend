var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const Annonce = require("../models/annonces");
const Reservation = require("../models/reservations");
const authenticateToken = require("../middleware/authentification"); // Middleware pour vérifier le token JWT

// Route pour ajouter une nouvelle réservation
router.post("/addReservation", authenticateToken, async (req, res) => {
  const annonceId = req.body.annonceId;

  // Vérification que toutes les propriétés nécessaires sont présentes dans le corps de la requête
  if (
    !checkBody(req.body, ["date", "heureDebut", "heureFin", "personne", "prix"])
  ) {
    return res.json({ result: false, error: "Champs manquants ou vides" });
  }

  try {
    // Recherche de l'annonce par son ID
    const annonce = await Annonce.findById(annonceId);

    if (!annonce) {
      return res.json({ result: false, error: "Annonce non trouvée" });
    }

    // Création d'une nouvelle réservation avec les données du corps de la requête
    const newReservation = new Reservation({
      titre: req.body.titre,
      date: req.body.date,
      heureDebut: req.body.heureDebut,
      heureFin: req.body.heureFin,
      personne: req.body.personne,
      ville: req.body.ville,
      prix: req.body.prix,
      annonceId: annonceId,
      userId: req.user.id, // ID de l'utilisateur récupéré du token JWT
    });

    // Sauvegarde de la réservation dans la base de données
    const savedReservation = await newReservation.save();
    res.json({ result: true, data: savedReservation });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

// Route pour récupérer les réservations de l'utilisateur connecté
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Recherche des réservations associées à l'utilisateur authentifié
    const reservations = await Reservation.find({
      userId: req.user.id,
    }).populate("annonceId");

    if (!reservations) {
      return res.json({ result: false, error: "Aucune réservation trouvée" });
    }

    // Retourner les réservations si elles sont trouvées
    res.json({ result: true, data: reservations });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

// Route pour supprimer une réservation
router.delete("/:id", authenticateToken, async (req, res) => {
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
