const mongoose = require("mongoose");

const connectionString =
  "mongodb+srv://abdelkaderhank:Q9GI322GSheyDILG@cluster0.fg2zcwt.mongodb.net/Hapyswim";

mongoose
  .connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log("Database connected"))
  .catch((error) => console.error(error));
