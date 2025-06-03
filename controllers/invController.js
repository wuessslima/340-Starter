const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const classValidate = require("../utilities/classification-validation");
const invValidate = require("../utilities/inventory-validation");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inventoryId;
  const data = await invModel.getInventoryById(inv_id);
  const grid = await utilities.buildDetailHTML(data);
  let nav = await utilities.getNav();
  const vehicleName = `${data.inv_make} ${data.inv_model}`;
  res.render("./inventory/detail", {
    title: vehicleName,
    nav,
    grid,
  });
};

invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
    messages: req.flash(),
  });
};

invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0]?.inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
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
    errors: null,
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
    classification_id,
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
    req.flash("notice", `The ${inv_make} ${inv_model} was successfully added.`);
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Sorry, the inventory could not be added.");
    res.status(501).render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav: await utilities.getNav(),
      classificationList: await utilities.buildClassificationList(
        classification_id
      ),
      ...req.body,
    });
  }
};

/* ***************************
 * Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 * Update inventory data
 * ************************** */
/* ***************************
 * Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
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
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
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
  )

  if (updateResult) {
    const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
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
    })
  }
}

/* ***************************
 * Build delete confirmation view
 * ************************** */
invCont.buildDeleteConfirmView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price
  })
}

/* ***************************
 * Delete inventory item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("notice", "The vehicle was successfully deleted.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the deletion failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}

module.exports = invCont;
