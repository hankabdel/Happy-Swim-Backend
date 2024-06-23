// Importation des modules nécessaires
var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const Annonce = require("../models/annonces");
const User = require("../models/users");

// Route pour ajouter une nouvelle annonce
router.post("/add", async (req, res) => {
  // Récupération du token d'autorisation depuis les en-têtes de la requête
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  // Vérification que toutes les propriétés nécessaires sont présentes dans le corps de la requête
  if (
    !checkBody(req.body, ["titre", "description", "ville", "personne", "prix"])
  ) {
    res.json({ result: false, error: "Champs manquants ou vides" });
    return;
  }

  // Recherche de l'utilisateur dans la base de données par le token
  const user = await User.findOne({ token: token });

  // Création d'une nouvelle annonce avec les données du corps de la requête et l'ID de l'utilisateur
  const newAnnonce = new Annonce({
    titre: req.body.titre,
    description: req.body.description,
    personne: req.body.personne,
    ville: req.body.ville,
    prix: req.body.prix,
    userId: user._id,
  });

  // Sauvegarde de l'annonce dans la base de données et envoi de la réponse au client
  newAnnonce.save().then((data) => {
    res.json({ result: true, data: data });
  });
});

// Route pour récupérer toutes les annonces
router.get("/recover", (req, res) => {
  // Récupération de toutes les annonces de la base de données
  Annonce.find()
    .then((data) => {
      res.json({ result: true, data: data });
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
    });
});

// Route pour supprimer une annonce
router.delete("/delete", async (req, res) => {
  // Récupération du token d'autorisation depuis les en-têtes de la requête
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  // Recherche de l'utilisateur dans la base de données par le token
  const user = await User.findOne({ token: token });
  console.log("USER", user._id);

  // Recherche de l'annonce associée à l'utilisateur
  const annonce = await Annonce.findOne({ userId: user._id });
  // Si l'annonce est trouvée, la supprimer
  if (annonce) {
    await Annonce.deleteOne({ _id: annonce._id });

    // Envoi de la réponse indiquant que l'annonce a été supprimée
    res.json({
      result: true,
      message: "Annonce supprimée",
      // annonceId: annonce._id,
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
router.get("/search", async (req, res) => {
  // Extraction du paramètre 'ville' des requêtes
  const { ville } = req.query;

  // Si le paramètre 'ville' n'est pas présent, renvoyer une erreur
  if (!ville) {
    return res.status(400).json({ error: "City is required" });
  }

  try {
    // Recherche des annonces dont la ville correspond (insensible à la casse)
    const annonces = await Annonce.find({ ville: new RegExp(ville, "i") });

    // Si aucune annonce n'est trouvée, renvoyer une erreur
    if (annonces.length === 0) {
      return res.status(404).json({ error: "No annonces found for this city" });
    }
    // Renvoyer les annonces trouvées
    res.json(annonces);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Exportation du routeur pour être utilisé dans d'autres parties de l'application
module.exports = router;
