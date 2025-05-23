// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

module.exports = router;

// Route to build inventory by item view
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));