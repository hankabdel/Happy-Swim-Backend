const mongoose = require("mongoose");

const reservationSchema = mongoose.Schema({
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

const Reservation = mongoose.model("reservations", reservationSchema);

module.exports = Reservation;
