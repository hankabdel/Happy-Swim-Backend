var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const Annonce = require("../models/annonces");
const User = require("../models/users");

// Route pour ajouter une nouvelle annonce
router.post("/", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (
    !checkBody(req.body, [
      "titre",
      "description",
      "ville",
      "personne",
      "prix",
    ]) ||
    req.body.prix <= 0 || // Vérifie que le prix est supérieur à 0
    typeof req.body.titre !== "string" || // Vérifie que le titre est une chaîne
    req.body.titre.trim() === "" // Vérifie que le titre n'est pas vide
  ) {
    return res.json({
      result: false,
      error: "Données invalides ou manquantes",
    });
  }

  const user = await User.findOne({ token: token });

  const newAnnonce = new Annonce({
    titre: req.body.titre,
    description: req.body.description,
    personne: req.body.personne,
    ville: req.body.ville,
    prix: req.body.prix,
    userId: user._id,
  });

  // Sauvegarde de l'annonce dans la base de données et envoi de la réponse au client
  try {
    const savedAnnonce = await newAnnonce.save();
    res.json({ result: true, data: savedAnnonce });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

// Route pour récupérer toutes les annonces
router.get("/", async (req, res) => {
  try {
    const data = await Annonce.find();
    res.json({ result: true, data: data });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

router.delete("/", async (req, res) => {
  try {
    // Vérifier la présence de l'en-tête Authorization
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({
        result: false,
        message: "Aucun jeton d'authentification fourni",
      });
    }

    // Extraire le token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        result: false,
        message: "Format du jeton incorrect",
      });
    }

    // Trouver l'utilisateur avec ce token
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({
        result: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Trouver l'annonce correspondant à l'utilisateur
    const annonce = await Annonce.findOne({ userId: user._id });
    if (!annonce) {
      return res.status(404).json({
        result: false,
        message: "Aucune annonce trouvée pour cet utilisateur",
      });
    }

    // Supprimer l'annonce
    await Annonce.deleteOne({ _id: annonce._id });

    // Réponse après suppression
    return res.status(200).json({
      result: true,
      message: "Annonce supprimée avec succès",
    });
  } catch (error) {
    // Gestion des erreurs inattendues
    return res.status(500).json({
      result: false,
      message: "Une erreur s'est produite lors de la suppression de l'annonce",
      error: error.message,
    });
  }
});

//mesAnnonce:
// Route pour récupérer les annonces de l'utilisateur connecté
router.get("/mesAnnonces", async (req, res) => {
  // Récupération du token d'autorisation depuis les en-têtes de la requête
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // Recherche de l'utilisateur dans la base de données par le token
  const user = await User.findOne({ token: token });

  // Si l'utilisateur n'est pas trouvé, renvoyer une erreur
  if (!user) {
    res.json({ result: false, error: "Utilisateur non trouvé" });
    return;
  }

  // Recherche des annonces associées à l'utilisateur
  Annonce.find({ userId: user._id })
    .then((annonces) => {
      res.json({ result: true, data: annonces });
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
    });
});

// Route pour rechercher des annonces par ville
router.get("/searchAnnonces", async (req, res) => {
  const { ville } = req.query;

  if (!ville) {
    return res
      .status(400)
      .json({ result: false, error: "Ville requise pour la recherche" });
  }

  try {
    const annonces = await Annonce.find({ ville: new RegExp(ville, "i") });

    // Ajout de vérification pour s'assurer que 'annonces' est bien un tableau
    if (!Array.isArray(annonces)) {
      throw new Error("Le résultat des annonces n'est pas un tableau");
    }

    if (annonces.length === 0) {
      return res.status(404).json({
        result: false,
        error: `Aucune annonce trouvée pour la ville : ${ville}`,
      });
    }

    res.json({ result: true, data: annonces });
  } catch (error) {
    console.error("Erreur:", error.message); // Log de l'erreur
    res.status(500).json({ result: false, error: "Erreur interne du serveur" });
  }
});

// Exportation du routeur pour être utilisé dans d'autres parties de l'application
module.exports = router;
