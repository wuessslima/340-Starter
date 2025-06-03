// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const Util = require("../utilities");
const classValidate = require("../utilities/classification-validation");
const invValidate = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", Util.handleErrors(invController.buildByClassificationId));

// Route to build inventory by item view
router.get("/detail/:inventoryId", Util.handleErrors(invController.buildByInventoryId));

// Management routes
router.get("/", Util.checkAuthorization, Util.handleErrors(invController.buildManagement));
router.get("/add-classification", Util.checkAuthorization, Util.handleErrors(invController.buildAddClassification));
router.get("/add-inventory", Util.handleErrors(invController.buildAddInventory));

// Process the new classification data
router.post(
    "/add-classification",
    classValidate.classificationRules(),
    classValidate.checkClassData,
    Util.handleErrors(invController.addClassification)
);

// Process the new inventory data
router.post(
    "/add-inventory",
    invValidate.inventoryRules(),
    invValidate.checkInvData,
    Util.handleErrors(invController.addInventory)
);

router.get("/getInventory/:classification_id", 
  Util.handleErrors(invController.getInventoryJSON))

  /* ***************************
 * Build edit inventory view
 * ************************** */
router.get("/edit/:inv_id", 
  Util.handleErrors(invController.editInventoryView))


/* ***************************
 * Process Inventory Update
 * ************************** */
router.post("/update",
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  Util.handleErrors(invController.updateInventory))

  /* ***************************
 * Build delete confirmation view
 * ************************** */
router.get("/delete/:inv_id",
  Util.handleErrors(invController.buildDeleteConfirmView))

/* ***************************
 * Process inventory deletion
 * ************************** */
router.post("/delete",
  Util.handleErrors(invController.deleteInventoryItem))

module.exports = router;