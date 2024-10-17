const mongoose = require("mongoose");

const connectionString = mongoose.Schema({
  titre: String,
  description: String,
  ville: String,
  personne: Number,
  prix: Number,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

const Annonce = mongoose.model("annonces", connectionString);

module.exports = Annonce;
