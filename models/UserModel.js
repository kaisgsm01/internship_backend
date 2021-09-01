const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator")

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  firstName:{ type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true , unique: true },
  password: { type: String, required: true, minlength: 6 },
  memos: [{ type: mongoose.Types.ObjectId, required: true ,ref: 'memos'}],
  clients: [{ type: mongoose.Types.ObjectId, required: true ,ref: 'clients'}],
  createdTasks: [{ type: mongoose.Types.ObjectId, required: true ,ref: 'tasks'}],
  assignedTasks:[{ type: mongoose.Types.ObjectId, required: true ,ref: 'tasks'}]
});

userSchema.plugin(uniqueValidator);

const userModel=mongoose.model('users',userSchema);
module.exports=userModel;