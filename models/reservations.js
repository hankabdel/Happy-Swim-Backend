const mongoose = require("mongoose");

const reservationString = mongoose.Schema({
  titre: String,
  date: Date,
  heureDebut: String,
  heureFin: String,
  personne: Number,
  ville: String,
  prix: Number,
  annonceId: { type: mongoose.Schema.Types.ObjectId, ref: "annonces" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

const Reservation = mongoose.model("reservations", reservationString);

module.exports = Reservation;
