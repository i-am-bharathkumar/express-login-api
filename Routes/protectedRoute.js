const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/verifyToken");

router.get("/", verifyToken, (req, res) => {
  res.json({
    message: `Welcome to the protected dashboard, ${req.user.email}`,
    user: req.user,
  });
});

module.exports = router;
