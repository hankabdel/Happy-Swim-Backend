var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const Annonce = require("../models/annonces");
const User = require("../models/users");
const authenticateToken = require("../middleware/authentification"); // Import du middleware

// Route pour ajouter une nouvelle annonce
router.post("/", authenticateToken, async (req, res) => {
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

  // Création d'une nouvelle annonce avec les données du corps de la requête et l'ID de l'utilisateur
  const newAnnonce = new Annonce({
    titre: req.body.titre,
    description: req.body.description,
    personne: req.body.personne,
    ville: req.body.ville,
    prix: req.body.prix,
    userId: req.user._id,
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

// Route pour supprimer une annonce

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const annonceId = req.params.id;
    if (!annonceId) {
      return res
        .status(400)
        .json({ result: false, message: "ID d'annonce non fourni" });
    }

    const annonce = await Annonce.findOne({
      _id: annonceId,
      userId: req.user._id,
    });
    if (!annonce) {
      console.log(
        `Tentative de suppression d'une annonce non trouvée ou non autorisée pour l'utilisateur ${req.user._id}`
      );
      return res.status(404).json({
        result: false,
        message: "Annonce non trouvée ou non autorisée",
      });
    }

    await Annonce.deleteOne({ _id: annonceId });
    res.json({ result: true, message: "Annonce supprimée" });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

//mesAnnonce:

// Route pour récupérer les annonces de l'utilisateur connecté
router.get("/", authenticateToken, async (req, res) => {
  try {
    const annonces = await Annonce.find({ userId: req.user._id });
    res.json({ result: true, data: annonces });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
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
