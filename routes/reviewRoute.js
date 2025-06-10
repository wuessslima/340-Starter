const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const utilities = require('../utilities');
const validate = require('../utilities/review-validation');

// Rota para mostrar formulário
router.get('/add/:inv_id',
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildReviewForm)
);

// Rota para processar formulário
router.post('/add',
  utilities.checkLogin,
  validate.reviewRules(),
  validate.checkReviewData,
  utilities.handleErrors(reviewController.addReview)
);

module.exports = router;