const express = require("express");
const bcrypt = require('bcryptjs');
const db = require("../db/conn.js");

const router = express.Router();

router.put("/", async (req, res) => {
const { email, nome  } = req.body

})

module.exports = router;