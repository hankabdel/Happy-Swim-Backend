const jwt = require("jsonwebtoken");
const User = require("../models/users"); // Le modèle User

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Récupérer le token dans l'en-tête

  if (!token) return res.sendStatus(401); // Si aucun token n'est présent, renvoyer une erreur 401

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    console.log("Clé secrète JWT:", process.env.JWT_SECRET);
    console.log("Received token:", token);
    if (err) {
      console.error("Erreur lors de la vérification du token:", err);
      return res.sendStatus(403); // Si le token est invalide
    }

    req.user = user; // Stocker les informations de l'utilisateur dans la requête
    next(); // Passer au middleware ou à la route suivante
  });
};

module.exports = authenticateToken;
