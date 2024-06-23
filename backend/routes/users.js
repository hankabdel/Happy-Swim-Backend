// Importation des modules nécessaires
var express = require("express");
var router = express.Router();
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

// Route pour obtenir la liste des utilisateurs (exemple basique)
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// Route pour l'inscription des utilisateurs
router.post("/signup", (req, res) => {
  // Vérification que toutes les propriétés nécessaires sont présentes dans le corps de la requête
  if (!checkBody(req.body, ["prenom", "nom", "email", "password"])) {
    res.json({ result: false, error: "Champs manquants ou vides" });
    return;
  }

  // Recherche d'un utilisateur avec le même prénom dans la base de données
  User.findOne({ prenom: req.body.prenom }).then((data) => {
    // Si aucun utilisateur n'est trouvé, créer un nouveau compte utilisateur
    if (data === null) {
      // Hachage du mot de passe
      const hash = bcrypt.hashSync(req.body.password, 10);

      // Création du nouvel utilisateur avec les informations fournies
      const newUser = new User({
        prenom: req.body.prenom,
        nom: req.body.nom,
        password: hash,
        email: req.body.email,
        token: uid2(32), // Génération d'un token unique pour l'utilisateur
      });

      // Sauvegarde du nouvel utilisateur dans la base de données et envoi de la réponse au client
      newUser.save().then((data) => {
        res.json({ result: true, token: data.token });
      });
    } else {
      // Si l'utilisateur existe déjà, renvoyer une erreur
      res.json({ result: false, error: "l'utilisateur existe déjà" });
    }
  });
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
