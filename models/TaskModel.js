const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  addedDate: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: false },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "users" },
  assignedTo: [{ type: mongoose.Types.ObjectId, required: true, ref: "users" }],
});

const taskModel = mongoose.model('tasks',taskSchema);

module.exports=taskModel;