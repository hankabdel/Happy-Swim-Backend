const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  prenom: String,
  nom: String,
  password: String,
  email: String,
  token: String,
});

const User = mongoose.model("users", userSchema);

module.exports = User;
