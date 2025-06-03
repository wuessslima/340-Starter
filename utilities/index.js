const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });

  // Add Admin link if user is logged in and is an admin
  if (req && req.session.user && req.session.user.account_type === "Admin") {
    list +=
      '<li><a href="/inv/" title="Inventory Management">Management</a></li>';
  }

  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

Util.buildDetailHTML = async function (vehicle) {
  const html = `
  <div class="detail-container">
      <div class="detail-image">
        <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${
    vehicle.inv_model
  }">
      </div>
      <div class="detail-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p class="price">Price: $${new Intl.NumberFormat("en-US").format(
          vehicle.inv_price
        )}</p>
        <p><strong>Mileage:</strong> ${new Intl.NumberFormat("en-US").format(
          vehicle.inv_miles
        )} miles</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <div class="description">
          <h3>Description:</h3>
          <p>${vehicle.inv_description}</p>
        </div>
      </div>
    </div>
  `;
  return html;
};

/* **************************************
 * Build the classification select list
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let list =
    '<select name="classification_id" id="classificationList" required>';
  list += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    list += `<option value="${row.classification_id}"`;
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      list += " selected";
    }
    list += `>${row.classification_name}</option>`;
  });
  list += "</select>";
  return list;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = async (req, res, next) => {
  // Lista de rotas públicas que não requerem autenticação
  const publicRoutes = ['/account/login', '/account/register', '/'];
  
  if (publicRoutes.includes(req.path)) {
    return next();
  }

  try {
    if (!req.cookies.jwt) {
      return res.redirect('/account/login');
    }

    const decoded = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
    res.locals.accountData = decoded;
    res.locals.loggedin = 1;
    next();
  } catch (error) {
    console.error('JWT Error:', error.message);
    res.clearCookie('jwt');
    return res.redirect('/account/login');
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/* ***************************
 * Check if user is authorized (Employee or Admin)
 * ************************** */
Util.checkAuthorization = (req, res, next) => {
  if (
    res.locals.accountData?.account_type === "Employee" ||
    res.locals.accountData?.account_type === "Admin"
  ) {
    return next();
  }
  req.flash(
    "notice",
    "You must be logged in as an employee or admin to access this page."
  );
  res.redirect("/account/login");
};

module.exports = Util;
