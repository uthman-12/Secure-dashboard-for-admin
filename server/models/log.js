const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  action: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Log", logSchema);
