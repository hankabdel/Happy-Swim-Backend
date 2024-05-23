const mongoose = require("mongoose");

const annonceSchema = mongoose.Schema({
  titre: String,
  description: String,
  adresse: String,
  personne: Number,
  prix: Number,
});

const Annonce = mongoose.model("annonce", annonceSchema);

module.exports = Annonce;
