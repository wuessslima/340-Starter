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

module.exports = validate;