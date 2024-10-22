var express = require("express");
var router = express.Router();
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

// Route pour l'inscription des utilisateurs
router.post("/signup", async (req, res) => {
  if (!checkBody(req.body, ["prenom", "nom", "email", "password"])) {
    return res.json({ result: false, error: "Champs manquants ou vides" });
  }

  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.json({
        result: false,
        error: "L'utilisateur est déjà enregistré",
      });
    }

    const hash = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      prenom: req.body.prenom,
      nom: req.body.nom,
      email: req.body.email,
      password: hash,
      token: token,
    });

    await newUser.save();
    res.json({ result: true, token: newUser.token });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour la connexion des utilisateurs
router.post("/signin", (req, res) => {
  // Vérification que toutes les propriétés nécessaires sont présentes dans le corps de la requête
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Champs manquants ou vides" });
    return;
  }

  // Recherche de l'utilisateur dans la base de données par email
  User.findOne({ email: req.body.email }).then((data) => {
    // Vérification que l'utilisateur est trouvé et que le mot de passe est correct
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({
        result: true,
        token: data.token,
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
      });
    } else {
      // Si l'email n'est pas trouvé ou le mot de passe est incorrect, renvoyer une erreur
      res.json({
        result: false,
        error: "Email introuvable ou mot de passe erroné",
      });
    }
  });
});

// Exportation du routeur pour être utilisé dans d'autres parties de l'application
module.exports = router;
