/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const session = require("express-session");
const pool = require('./database/');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const flash = require('connect-flash');

/* ***********************
 * Local Variables
 *************************/
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const accountRoute = require("./routes/accountRoute");
const inventoryRoute = require("./routes/inventoryRoute");
const reviewRoute = require("./routes/reviewRoute");
const Util = require("./utilities/");

/* ***********************
 * Middleware Configuration
 *************************/
// Session configuration (optimized)
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
    pruneSessionInterval: 60 * 60 // Cleanup every hour
  }),
  secret: process.env.SESSION_SECRET,
  resave: false, // Changed from true to reduce queries
  saveUninitialized: false, // Changed from true for security
  name: 'sessionId',
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Body parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Static files
app.use(express.static('public'));

// JWT token check
app.use(Util.checkJWTToken);

/* ***********************
 * View Engine Configuration
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Route Definitions
 * IMPORTANT: Order matters!
 *************************/
// Static routes
app.use(static);

// Account routes
app.use("/account", accountRoute);

// Inventory routes
app.use("/inv", inventoryRoute);

// Review routes (must come before error handlers)
app.use("/reviews", reviewRoute);

// Home route
app.get("/", Util.handleErrors(baseController.buildHome));

/* ***********************
 * Error Handlers
 * MUST be last middleware
 *************************/
// 404 Not Found handler
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' });
});

// Main error handler
app.use(async (err, req, res, next) => {
  let nav = await Util.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  
  if (err.status == 404) {
    res.status(404).render("errors/error", {
      title: '404 - Not Found',
      message: err.message,
      nav
    });
  } else {
    res.status(500).render("errors/error", {
      title: '500 - Server Error',
      message: 'Something went wrong. Please try again later.',
      nav
    });
  }
});

/* ***********************
 * Server Initialization
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || 'localhost';

app.listen(port, () => {
  console.log(`Server running at http://${host}:${port}`);
  console.log(`Review routes available at /reviews`);
});