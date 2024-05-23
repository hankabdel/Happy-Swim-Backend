var express = require("express");
var router = express.Router();
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

/* la liste des utilisateurs */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["prenom", "nom", "email", "password"])) {
    res.json({ result: false, error: "Champs manquants ou vides" });
    return;
  }

  User.findOne({ prenom: req.body.prenom }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        prenom: req.body.prenom,
        nom: req.body.nom,
        password: hash,
        email: req.body.email,
        token: uid2(32),
      });

      newUser.save().then((data) => {
        res.json({ result: true, token: data.token });
      });
    } else {
      // L'utilisateur existe déjà dans la base de données
      res.json({ result: false, error: "l'utilisateur existe déjà" });
    }
  });
});

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Champs manquants ou vides" });
    return;
  }

  User.findOne({ email: req.body.email }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({
        result: true,
        token: data.token,
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
      });
    } else {
      res.json({
        result: false,
        error: "Email introuvable ou mot de passe erroné",
      });
    }
  });
});

module.exports = router;
