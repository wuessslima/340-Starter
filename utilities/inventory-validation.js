const { body, validationResult } = require("express-validator");
const utilities = require(".");
const validate = {};

validate.inventoryRules = () => {
    return [
        body("classification_id")
            .notEmpty()
            .withMessage("Classification is required."),
            
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage("Make is required and must be at least 3 characters."),
            
        // ... rest of your inventory validation rules
    ];
};

validate.checkInvData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        let classificationList = await utilities.buildClassificationList(req.body.classification_id);
        return res.render("inventory/add-inventory", {
            title: "Add New Inventory",
            nav,
            classificationList,
            errors: errors.array(),
            ...req.body
        });
    }
    next();
};

/* ***************************
 * Check update data and return errors or continue
 * ************************** */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)
    const itemName = `${req.body.inv_make} ${req.body.inv_model}`
    
    return res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: errors.array(),
      inv_id: req.body.inv_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      classification_id: req.body.classification_id
    })
  }
  next()
}

module.exports = validate;