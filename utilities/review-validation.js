const { body, validationResult } = require('express-validator');
const utilities = require('./');
const invModel = require('../models/inventory-model');

const validate = {
  reviewRules: () => {
    return [
      body('review_text')
        .trim()
        .isLength({ min: 10 })
        .withMessage('A avaliação deve ter pelo menos 10 caracteres'),
      body('review_rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('A nota deve ser entre 1 e 5')
    ];
  },

  checkReviewData: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const nav = await utilities.getNav();
      const vehicleData = await invModel.getInventoryById(req.body.inv_id);
      return res.render('reviews/add-review', {
        title: `Avaliar ${vehicleData.inv_make} ${vehicleData.inv_model}`,
        nav,
        errors: errors.array(),
        inv_id: req.body.inv_id,
        vehicleData
      });
    }
    next();
  }
};

module.exports = validate;