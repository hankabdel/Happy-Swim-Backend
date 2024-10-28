var express = require("express");
var router = express.Router();
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

// Route pour l'inscription des utilisateurs
router.post("/signup", async (req, res) => {
  if (!checkBody(req.body, ["prenom", "nom", "email", "password"])) {
    res.json({
      result: false,
      error: "Tous les champs doivent être renseignés",
    });
    return;
  }

  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.json({
        result: false,
        error: "Utilisateur déjà existant",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      prenom: req.body.prenom,
      nom: req.body.nom,
      email: req.body.email,
      password: hashedPassword,
      token: uid2(32),
    });

    await newUser.save();
    res.json({ result: true, user: newUser });
  } catch (error) {
    res.status(500).json({ error: "Erreur interne" });
  }
});

// Route pour la connexion des utilisateurs
router.post("/signin", async (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    return res
      .status(400)
      .json({ result: false, error: "Champs manquants ou vides" });
  }

  try {
    const user = await User.findOne({ email: req.body.email });

    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      res.status(200).json({
        result: true,
        token: user.token,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
      });
    } else {
      res.status(401).json({
        result: false,
        error: "Email introuvable ou mot de passe incorrect",
      });
    }
  } catch (error) {
    res.status(500).json({ result: false, error: "Erreur interne du serveur" });
  }
});
// Exportation du routeur pour être utilisé dans d'autres parties de l'application
module.exports = router;
