// Importation des modules nécessaires
var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const Annonce = require("../models/annonces");
const User = require("../models/users");
const Reservation = require("../models/reservations");

// Route pour ajouter une nouvelle réservation
router.post("/addResa", async (req, res) => {
  // Récupération du token d'autorisation depuis les en-têtes de la requête
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const annonceId = req.body.annonceId;

  // Vérification que le token est présent
  if (!token) {
    res.json({ result: false, error: "Token manquant" });
    return;
  }

  // Vérification que toutes les propriétés nécessaires sont présentes dans le corps de la requête
  if (
    !checkBody(req.body, ["date", "heureDebut", "heureFin", "personne", "prix"])
  ) {
    res.json({ result: false, error: "Champs manquants ou vides" });
    return;
  }

  // Recherche de l'utilisateur dans la base de données par le token
  const user = await User.findOne({ token: token });
  // Recherche de l'annonce par son ID
  const annonce = await Annonce.findById({ _id: annonceId });

  // Vérification que l'utilisateur et l'annonce existent
  if (!user || !annonce) {
    res.json({
      result: false,
      error: "Utilisateur ou annonce non trouvé ou non autorisé",
    });
    return;
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
    userId: user._id,
  });

  // Sauvegarde de la réservation dans la base de données et envoi de la réponse au client
  newReservation
    .save()
    .then((data) => {
      res.json({ result: true, data: data });
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
    });
});

// Route pour récupérer les réservations de l'utilisateur connecté
router.get("/", async (req, res) => {
  // Récupération du token d'autorisation depuis les en-têtes de la requête
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // Recherche de l'utilisateur dans la base de données par le token
  const user = await User.findOne({ token: token });

  // Vérification que l'utilisateur existe
  if (!user) {
    res.json({ result: false, error: "Utilisateur non trouvé" });
    return;
  }

  // Recherche des réservations associées à l'utilisateur et peuplement du champ `annonceId`
  Reservation.find({ userId: user._id })
    .populate("annonceId")
    .then((reservations) => {
      res.json({ result: true, data: reservations });
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
    });
});

// Exportation du routeur pour être utilisé dans d'autres parties de l'application
module.exports = router;
