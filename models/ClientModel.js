const mongoose = require("mongoose");

const clientSchema = mongoose.Schema({
  creator: { type:mongoose.Types.ObjectId, required: true,ref:"users" },
  name: { type: String, required: true },
  twitter: { type: String, required: false },
  linkedin: { type: String, required: false },
  facebook: { type: String, required: false },
  telephone: { type: String, required: false },
  addedDate: { type: Date, required: true },
});

const clientModel = mongoose.model("clients", clientSchema);

module.exports = clientModel;
