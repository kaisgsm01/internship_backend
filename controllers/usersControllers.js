const mongoose = require("mongoose");
const UserModel = require("../models/UserModel");
const { validationResult } = require('express-validator');
const HttpError = require("../models/http-error");
const userModel = require("../models/UserModel");

const signupUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  const { userName, email, password,firstName,lastName} = req.body;
  let existingUser;
  try {
    existingUser = await UserModel.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }
  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    );
    return next(error);
  }

  const user = new UserModel({ userName: userName,firstName:firstName,lastName:lastName, email: email, password: password,memos:[],clients:[],createdTasks:[],assignedTasks:[]});
  await user.save();
  res.json({ userID: user._id });
};

const logginUser = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await UserModel.findOne({ email: email });
  
  } catch (err) {
    const error = new HttpError(
      'Loggin in failed, please try again later.',
      500
    );
    return next(error);
  }
  if (!existingUser || (existingUser.password !== password)) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    );
    return next(error);

  } else {
    res.json({ userID: existingUser._id });
  }
};

const getUsers= async (req,res,next) => {
  let listOfUsers;
  try {
    listOfUsers = await userModel.find();
  } catch (err) {
    const error = new HttpError("Could not find clients try again later", 500);
    return next(error);
  }
  res.json(listOfUsers.map((e) => e.toObject({ getters: true })));
}
const getUser=async(req,res,next)=>{
  const userID=req.params.uid;
  let user;
  try{
    user = await userModel.findById(userID);
  }catch(err){ const error = new HttpError("Could not find task try again later",500);
  return next(error);}
  if (!user){
    const error = new HttpError("Could not find task with the specified ID",404);
    return next(error);
  }
  res.json(user);
}

const updateUser = async(req,res,next) =>{
  const userID = req.params.uid;
  try{
    await userModel.findOneAndUpdate({ _id: userID }, { email: req.body.email,userName:req.body.userName,password:req.body.password });
  }catch(err){
      const error = new HttpError("Something went wrong, could not update user.",500);
      return next(error);

  }  
  res.json({ message: "update finished!" });
};
exports.updateUser=updateUser;
exports.signupUser=signupUser;
exports.logginUser=logginUser;
exports.getUsers=getUsers;
exports.getUser=getUser;