const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const classValidate = require('../utilities/classification-validation');
const invValidate = require('../utilities/inventory-validation');



const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inventoryId
  const data = await invModel.getInventoryById(inv_id)
  const grid = await utilities.buildDetailHTML(data)
  let nav = await utilities.getNav()
  const vehicleName = `${data.inv_make} ${data.inv_model}`
  res.render("./inventory/detail", {
    title: vehicleName,
    nav,
    grid,
  })
}

invCont.buildManagement = async function (req, res, next) {
    let nav = await utilities.getNav();
    res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        messages: req.flash()
    });
}

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null
    });
};

invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body;
    const regResult = await invModel.addClassification(classification_name);
    
    if (regResult) {
        req.flash(
            "notice",
            `Classification ${classification_name} was successfully added.`
        );
        res.redirect("/inv/");
    } else {
        req.flash("notice", "Sorry, the classification could not be added.");
        res.status(501).render("inventory/add-classification", {
            title: "Add New Classification",
            nav: await utilities.getNav(),
        });
    }
};

invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        classificationList,
        errors: null
    });
};

invCont.addInventory = async function (req, res) {
  const {
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
    } = req.body;
    const regResult = await invModel.addInventory(
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
    );
    if (regResult) {
        req.flash(
            "notice",
            `The ${inv_make} ${inv_model} was successfully added.`
        );
        res.redirect("/inv/");
    } else {
        req.flash("notice", "Sorry, the inventory could not be added.");
        res.status(501).render("inventory/add-inventory", {
            title: "Add New Inventory",
            nav: await utilities.getNav(),
            classificationList: await utilities.buildClassificationList(classification_id),
            ...req.body
        });
    }
};

module.exports = invCont