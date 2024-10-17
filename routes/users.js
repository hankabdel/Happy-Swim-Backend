var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt"); // Hachage du mot de passe
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");

// Clé secrète pour signer les tokens (généralement stockée dans le fichier .env)
const JWT_SECRET = process.env.JWT_SECRET || "secret_super_securise";

// Fonction pour générer un token JWT avec expiration
function generateToken(user) {
  return jwt.sign(
    {
      id: user._id, // Inclut l'ID de l'utilisateur dans le token.
      prenom: user.prenom, // Inclut le prénom de l'utilisateur dans le token.
      nom: user.nom, // Inclut le nom de l'utilisateur dans le token.
      email: user.email, // Inclut l'adresse email de l'utilisateur dans le token.
    },
    JWT_SECRET, // Utilise la clé secrète pour signer le token.
    { expiresIn: "24h" } // Le token expirera après 24 heures.
  );
}

// Route pour l'inscription des utilisateurs
router.post("/signin", async (req, res) => {
  console.log("Requête de connexion reçue"); // Vérifiez si la route est atteinte

  // Vérifie que les champs requis sont présents dans la requête
  if (!checkBody(req.body, ["email", "password"])) {
    console.log("Champs manquants ou vides");
    return res.json({ result: false, error: "Champs manquants ou vides" });
  }

  try {
    // Recherche de l'utilisateur dans la base de données par email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      console.log("Utilisateur non trouvé");
      return res.json({ result: false, error: "Email introuvable" });
    }

    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      console.log("Mot de passe incorrect");
      return res.json({ result: false, error: "Mot de passe incorrect" });
    }

    // Génération du token JWT après validation du mot de passe
    const token = generateToken(user);

    // Réponse avec succès et envoi du token JWT et des informations de l'utilisateur au client
    res.json({
      result: true,
      token, // Le token JWT
      prenom: user.prenom, // Le prénom de l'utilisateur
      nom: user.nom, // Le nom de l'utilisateur
      email: user.email, // L'email de l'utilisateur
    });
  } catch (error) {
    console.error("Erreur serveur:", error.message); // Affichez les erreurs du serveur
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Exportation du routeur pour être utilisé dans d'autres parties de l'application
module.exports = router;
