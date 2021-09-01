const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const memoModel = require("../models/MemoModel");
const userModel = require("../models/UserModel");

const addMemoByUserID = async (req, res, next) => {
  const userID = req.params.uid;
  const { title, description } = req.body;
  const nowDate = new Date();
  const memo = memoModel({
    title: title,
    description: description,
    date: nowDate,
    userID: userID,
  });

  let user;
  try{
    user = await userModel.findById(userID);
  }catch(err){
      const error=new HttpError('Creating memo failed, please try again', 500);
      return next(error);
  }
  if(!user){
      const error = new HttpError('Could not find user for provided id', 404);
      return next(error);
  }
  try{
    const sess = await mongoose.startSession();
    //   console.log('\x1b[36m%s\x1b[0m', user);
      sess.startTransaction();
      await memo.save({ session: sess });
      user.memos.push(memo);
      await user.save({ session: sess });
      await sess.commitTransaction();
  }catch(err){
    const error=new HttpError('Creating memo failed, please try again', 500);
    return next(error);
  }
  res.json({ message: "Memo Saved!" });
};

const getMemosByUserID = async (req, res, next) => {
  userID = req.params.uid;
  let memos;
  try{
    memos = await memoModel.find({ userID: userID });
  }catch(err){
      const error = new HttpError("Could not find memos try again later",500);
      return next(error);
  }
  if (!memos){
    const error = new HttpError("Could not find memos for the provided user ID",404)
    return next(error);
  }
  res.json(memos.map((e) => e.toObject({ getters: true })));

};

const updateMemoById = async (req, res, next) => {
  const memoID = req.params.mid;
  try{
    await memoModel.findOneAndUpdate({ _id: memoID }, { title: req.body.title,description:req.body.description });
  }catch(err){
      const error = new HttpError("Something went wrong, could not update memo.",500);
      return next(error);

  }  
  res.json({ message: "update finished!" });
};

const deleteMemo = async (req, res, next) => {
  memoId = req.params.mid;
  let memo;
  try{
    memo = await memoModel.findById(memoId).populate("userID");
  }catch(err){
      const error = new HttpError("Something went wrong, could not delete memo.",500);
      return next(error);
  }
  if (!memo){
      const error = new HttpError("Could not find a memo for the provided ID",404);
      return next(error);
  }
  try{
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await memo.remove({ session: sess });
    memo.userID.memos.pull(memo);
    await memo.userID.save({ session: sess });
    await sess.commitTransaction();
  }catch(err){
    const error = new HttpError("Something went wrong, could not delete memo.",500);
    return next(error);
  }
  res.json({ message: "memo is deleted!" });
};
const getMemoById = async (req,res,next) =>{
  const mid=req.params.mid;
  let memo;
  try{
    memo = await memoModel.findById(mid);
  }catch(err){ const error = new HttpError("Could not find memo try again later",500);
  return next(error);}
  if (!memo){
    const error = new HttpError("Could not find memo with the specified ID",404);
    return next(error);
  }
  res.json(memo);
}
exports.addMemoByUserID = addMemoByUserID;
exports.getMemosByUserID = getMemosByUserID;
exports.updateMemoById = updateMemoById;
exports.deleteMemo = deleteMemo;
exports.getMemoById=getMemoById;
