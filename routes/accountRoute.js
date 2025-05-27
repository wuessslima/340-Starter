// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const Util = require("../utilities")

// Route to build the login view (handles the "My Account" link click)
router.get("/login", Util.handleErrors(accountController.buildLogin));
router.get("/register", Util.handleErrors(accountController.buildRegister));

router.post('/register', Util.handleErrors(accountController.registerAccount))

module.exports = router