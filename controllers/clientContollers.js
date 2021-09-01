const clientModel = require("../models/ClientModel");
const HttpError = require("../models/http-error");
const userModel = require("../models/UserModel");
const mongoose = require("mongoose");

const addClientByUserID = async (req, res, next) => {
  const userID = req.params.uid;
  const { twitter, linkedin, facebook, telephone, name } = req.body;
  const nowDate = new Date();
  const client = clientModel({
    creator: userID,
    name: name,
    addedDate: nowDate,
    facebook: facebook,
    linkedin: linkedin,
    telephone: telephone,
    twitter: twitter,
  });
  let creatorUser;

  try {
    creatorUser = await userModel.findById(userID);
  } catch (err) {
    const error = new HttpError(
      "Creating client failed, please try again",
      500
    );
    return next(error);
  }
  if (!creatorUser) {
    const error = new HttpError("Could not find user for provided id", 404);
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await client.save({ session: sess });
    creatorUser.clients.push(client);
    await creatorUser.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Cbreating client failed, please try again",
      500
    );
    return next(error);
  }

  res.json({ message: "saved to the database" });
};

const getClientsByUserID = async (req, res, next) => {
  const userID = req.params.uid;
  let userWithClients;
  try {
    userWithClients = await userModel.findById(userID).populate("clients");
  } catch (err) {
    const error = new HttpError("Could not find clients try again later", 500);
    return next(error);
  }
  if (!userWithClients) {
    const error = new HttpError(
      "Could not find user with the specified user ID",
      404
    );
    return next(error);
  }
  if (!userWithClients.clients.length === 0) {
    const error = new HttpError(
      "Could not find any client for the specified user",
      404
    );
    return next(error);
  }
  res.json(userWithClients.clients.map((e) => e.toObject({ getters: true })));
};

const updateClientByClientID = async (req, res, next) => {
  const clientID = req.params.cid;
  try {
    await clientModel.findOneAndUpdate(
      { _id: clientID },
      { name: req.body.name }
    );
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update client.",
      500
    );
    return next(error);
  }
  res.json({ message: "saved to the database" });
};

const deleteClient = async (req, res, next) => {
  const clientID = req.params.cid;
  let client;
  try {
    client = await clientModel.findById(clientID).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "aSomething went wrong, could not delete client.",
      500
    );
    return next(error);
  }
  if (!client) {
    const error = new HttpError("Could not find client for provided id", 404);
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await client.remove({ session: sess });
    client.creator.clients.pull(client);
    await client.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "bSomething went wrong, could not delete client.",
      500
    );
    return next(error);
  }

  res.json({ message: "delete is complete" });
};
const getClient = async (req, res, next) => {
  const cid = req.params.cid;
  let client;
  try {
    client = await clientModel.findById(cid);
  } catch (err) {
    const error = new HttpError("Could not find client try again later", 500);
    return next(error);
  }
  if (!client) {
    const error = new HttpError(
      "Could not find client with the specified ID",
      404
    );
    return next(error);
  }
  res.json(client);
};
exports.addClientByUserID = addClientByUserID;
exports.getClientsByUserID = getClientsByUserID;
exports.updateClientByClientID = updateClientByClientID;
exports.deleteClient = deleteClient;
exports.getClient = getClient;
