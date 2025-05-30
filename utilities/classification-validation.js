const { body, validationResult } = require("express-validator");
const utilities = require(".");
const validate = {};

validate.classificationRules = () => {
    return [
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a classification name.")
            .matches(/^[a-zA-Z0-9]+$/)
            .withMessage("Classification name cannot contain spaces or special characters.")
    ];
};

validate.checkClassData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        return res.render("inventory/add-classification", {
            title: "Add New Classification",
            nav,
            errors: errors.array()
        });
    }
    next();
};

module.exports = validate;