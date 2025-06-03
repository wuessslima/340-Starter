// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require("../utilities/account-validation");

// Route to build the login view (handles the "My Account" link click)
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(), // Note: Fixed typo from 'registation' to 'registration'
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

router.post("/login", 
  utilities.handleErrors(accountController.accountLogin)
);

// Process the login attempt
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildManagement)
);

router.get(
  "/",
  utilities.checkJWTToken,
  utilities.handleErrors(accountController.buildManagement)
);

module.exports = router;
