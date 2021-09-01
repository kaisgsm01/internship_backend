const express = require("express");
const { check } = require("express-validator");

const memosControllers = require("../controllers/memosControllers");
const clientControllers = require("../controllers/clientContollers");
const tasksControllers = require("../controllers/tasksControllers");
const usersControllers = require("../controllers/usersControllers");

router = express.Router();
router.get("/users/",usersControllers.getUsers);
router.get("/users/:uid",usersControllers.getUser);
router.post(
  "/users/signup",
  [
    check("userName").not().isEmpty(),
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllers.signupUser
);
router.post("/users/login", usersControllers.logginUser);
router.patch("/users/:uid",usersControllers.updateUser);

router.get("/users/:uid/clients", clientControllers.getClientsByUserID);
router.post("/users/:uid/clients", clientControllers.addClientByUserID);
router.patch("/clients/:cid", clientControllers.updateClientByClientID);
router.delete("/clients/:cid", clientControllers.deleteClient);
router.get("/clients/:cid", clientControllers.getClient);

router.get("/users/:uid/memos", memosControllers.getMemosByUserID);
router.post("/users/:uid/memos", memosControllers.addMemoByUserID);
router.patch("/memos/:mid", memosControllers.updateMemoById);
router.get("/memos/:mid", memosControllers.getMemoById);
router.delete("/memos/:mid", memosControllers.deleteMemo);

router.get("/users/:aid/assignedtasks", tasksControllers.getAssignedToYouTasks);
router.get("/users/:uid/createdtasks", tasksControllers.getAssignedTasks);
router.post("/users/:uid/tasks", tasksControllers.addTaskByUserID);
router.patch("/tasks/:tid", tasksControllers.updateTaskByTaskID);
router.delete("/tasks/:tid", tasksControllers.deleteTask);
router.get("/tasks/:tid", tasksControllers.getTask);

// router.get('/subordinates',getSubordinatesByUserID);
exports.router = router;
