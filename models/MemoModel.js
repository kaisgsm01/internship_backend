const mongoose = require("mongoose");

const memoSchema = mongoose.Schema({
  userID: { type: mongoose.Types.ObjectId, required: true ,ref: 'users'},
  title: { type: String, required: true },
  description: { type: String, required: false },
  date: { type: Date, required: true },
});

const memoModel = mongoose.model("memos", memoSchema);

module.exports = memoModel;
