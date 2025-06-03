const utilities = require("../utilities/")
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const accountController = {};

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null
    });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
        inputData: {}
    });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver Account Management View
 * ************************************ */
async function buildManagement(req, res, next) {
    try {
        if (!res.locals.accountData) {
      throw new Error("User data not available");
    }
    
    let nav = await utilities.getNav();
    res.render("account/management", {
      title: "Account Management",
      nav,
      accountData: res.locals.accountData,
      errors: null
        });
    } catch (error) {
        error.status = 500;
        next(error);
    }
}

/* ***************************
 * Build account update view
 * ************************** */
accountController.buildUpdateView = async function (req, res, next) {
  const account_id = parseInt(req.params.account_id)
  const accountData = await accountModel.getAccountById(account_id)
  
  res.render("account/update", {
    title: "Update Account",
    accountData,
    errors: null
  })
}

/* ***************************
 * Update account information
 * ************************** */
accountController.updateAccount = async function (req, res, next) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  
  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )

  if (updateResult) {
    req.flash("notice", "Account updated successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Account update failed.")
    res.redirect(`/account/update/${account_id}`)
  }
}

/* ***************************
 * Update password
 * ************************** */
accountController.updatePassword = async function (req, res, next) {
  const { account_id, account_password } = req.body
  const hashedPassword = await bcrypt.hash(account_password, 10)
  
  const updateResult = await accountModel.updatePassword(
    account_id,
    hashedPassword
  )

  if (updateResult) {
    req.flash("notice", "Password updated successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Password update failed.")
    res.redirect(`/account/update/${account_id}`)
  }
}

/* ***************************
 * Process logout request
 * ************************** */
accountController.logout = async function (req, res, next) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  res.redirect("/")
}

module.exports = { buildLogin, buildRegister, registerAccount, buildManagement, accountLogin }