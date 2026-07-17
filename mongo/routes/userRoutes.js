const express = require("express");

const router = express.Router();

const { register } = require("../models/controllers/userController");

router.post("/register", register);

module.exports = router;