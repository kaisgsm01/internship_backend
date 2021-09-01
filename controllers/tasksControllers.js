const taskModel = require("../models/TaskModel");
const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const userModel = require("../models/UserModel");
const { findById } = require("../models/UserModel");
const date = require("date-and-time");
const addTaskByUserID = async (req, res, next) => {
  const userID = req.params.uid;
  const now = date.format(new Date(), "ddd, DD MMM YYYY HH:mm");
  const { title, description, assignedTo } = req.body;
  let task;
  task = taskModel({
    addedDate: now,
    title: title,
    description: description,
    creator: userID,
    assignedTo: assignedTo || userID,
  });
  let creator;
  let user; //user in foreach loop
  try {
    creator = await userModel.findById(userID);
  } catch (err) {
    const error = new HttpError("Creating task failed, please try again", 500);
    return next(error);
  }
  if (!creator) {
    const error = new HttpError("User doesn't exist", 404);
    return next(error);
  }
  for (const userID of task.assignedTo) {
    try {
      user = await userModel.findById(userID);
    } catch (err) {
      const error = new HttpError(
        "Creating task failed, please try again",
        500
      );
      return next(error);
    }
    if (!user) {
      const error = new HttpError("User doesn't exist", 404);
      return next(error);
    }
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    // console.log('\x1b[36m%s\x1b[0m',creator.toObject({ getters: true }).name);
    await task.save({ session: sess });
    creator.createdTasks.push(task);
    await creator.save({ session: sess });
    for (let userID of task.assignedTo) {
      user = await userModel.findById(userID);
      user.assignedTasks.push(task);
      await user.save({ session: sess });
    }
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating task failed, please try again", 500);
    return next(error);
  }
  res.json({ message: "taskAdded!" });
};

const getAssignedToYouTasks = async (req, res, next) => {
  const AssignedToID = req.params.aid;
  let assignedUser;
  // console.log("\x1b[36m%s\x1b[0m",);
  try {
    assignedUser = await userModel
      .findById(AssignedToID)
      .populate("assignedTasks");
  } catch (err) {
    const error = new HttpError("Getting tasks failed, please try again", 500);
    return next(error);
  }
  res.json(
    await Promise.all(
      assignedUser.assignedTasks.map(async (e) => {
        const username = await (await userModel.findById(e.creator)).toObject()
          .userName;
        return {
          ...e.toObject({ getters: true }),
          creatorName: username,
        };
      })
    )
  );
};

const updateTaskByTaskID = async (req, res, next) => {
  const taskID = req.params.tid;
  const { title, description } = req.body;
  let task;
  try {
    task = await taskModel.findById(taskID);
  } catch (err) {
    const error = new HttpError("Updating task failed, please try again", 500);
    return next(error);
  }
  if (!task) {
    const error = new HttpError("Task doesn't exist", 404);
    return next(error);
  }
  title && (task.title = title);
  description && (task.description = description);
  try {
    task.save();
  } catch (err) {
    const error = new HttpError("Updating task failed, please try again", 500);
    return next(error);
  }
  res.json({ message: "update finished!" });
};

const getAssignedTasks = async (req, res, next) => {
  const AssignedID = req.params.uid;
  let user;
  try {
    user = await userModel.findById(AssignedID).populate("createdTasks");
  } catch (err) {
    const error = new HttpError("Getting tasks failed, please try again", 500);
    return next(error);
  }
  if (!user) {
    const error = new HttpError(
      "Could not find user with the specified user ID",
      404
    );
    return next(error);
  }
  res.json(
    await Promise.all(
      user.createdTasks.map(async (task) => {
        return {
          ...task.toObject({ getters: true }),
          assignedTo: (await userModel.find( {_id:task.assignedTo}
          )).map((user) => user.toObject().userName),
        };
      })
    )
  );
};

const deleteTask = async (req, res, next) => {
  taskID = req.params.tid;
  let task;
  try {
    task = await taskModel
      .findById(taskID)
      .populate("creator")
      .populate("assignedTo");
  } catch (err) {
    const error = new HttpError(
      "Error removing the task, please try again later",
      500
    );
    return next(error);
  }
  if (!task) {
    const error = new HttpError(
      "Could not find task with the specified ID",
      404
    );
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await task.remove({ session: sess });
    task.creator.createdTasks.pull(task);
    await task.creator.save({ session: sess });
    for (let user of task.assignedTo) {
      user.assignedTasks.pull(task);
      await user.save({ session: sess });
    }
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Error removing the task, please try again later",
      500
    );
    return next(error);
  }
  res.json({ message: "it worked" });
};


const getTask = async (req,res,next)=>{
  const taskID=req.params.tid;
  let task;
  try{
    task = await taskModel.findById(taskID);
  }catch(err){ const error = new HttpError("Could not find task try again later",500);
  return next(error);}
  if (!task){
    const error = new HttpError("Could not find task with the specified ID",404);
    return next(error);
  }
  res.json({title:task.title,description:task.description});
}
exports.addTaskByUserID = addTaskByUserID;
exports.getAssignedToYouTasks = getAssignedToYouTasks;
exports.updateTaskByTaskID = updateTaskByTaskID;
exports.getAssignedTasks = getAssignedTasks;
exports.deleteTask = deleteTask;
exports.getTask=getTask;
