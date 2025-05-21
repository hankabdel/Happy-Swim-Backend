const mongoose = require("mongoose");

const annonceSchema = mongoose.Schema({
  titre: String,
  description: String,
  ville: String,
  personne: Number,
  prix: Number,
  imageUrl: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

const Annonce = mongoose.model("annonces", annonceSchema);

module.exports = Annonce;
