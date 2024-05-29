const mongoose = require("mongoose");

const connectionString = mongoose.Schema({
  date: Date,
  heureDebut: String,
  heureFin: String,
  personne: Number,
  prix: Number,
  annonceId: { type: mongoose.Schema.Types.ObjectId, ref: "annonces" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

const Reservation = mongoose.model("reservations", connectionString);

module.exports = Reservation;
