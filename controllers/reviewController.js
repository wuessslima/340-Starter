const reviewModel = require('../models/review-models');
const utilities = require('../utilities/');
const invModel = require('../models/inventory-model');

const reviewController = {};

/* ***************************
 * Build Review Form
 * ************************** */
reviewController.buildReviewForm = async function(req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const vehicleData = await invModel.getInventoryById(inv_id);
    
    if (!vehicleData) {
      req.flash('notice', 'Vehicle does not find.');
      return res.redirect('/inv');
    }
    
    const nav = await utilities.getNav();
    res.render('reviews/add-review', {
      title: `Evaluate ${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      errors: null,
      inv_id,
      vehicleData
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Add New Review
 * ************************** */
reviewController.addReview = async function (req, res, next) {
  const { inv_id, account_id, review_text, review_rating } = req.body;
  const nav = await utilities.getNav();
  
  try {
    await reviewModel.addReview(inv_id, account_id, review_text, review_rating);
    req.flash('notice', 'Thank you for your review! It will be visible after approval.');
    res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    req.flash('notice', 'Sorry, there was an error submitting your review.');
    res.redirect(`/reviews/add/${inv_id}`);
  }
};

/* ***************************
 * Build Reviews Management View
 * ************************** */
reviewController.buildReviewsManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const reviews = await reviewModel.getPendingReviews();
    
    res.render('reviews/review-management', {
      title: 'Review Management',
      nav,
      reviews: reviews.rows,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Approve Review
 * ************************** */
reviewController.approveReview = async function (req, res, next) {
  const review_id = parseInt(req.params.review_id);
  
  try {
    await reviewModel.approveReview(review_id);
    req.flash('notice', 'Review approved successfully.');
    res.redirect('/reviews/manage');
  } catch (error) {
    req.flash('notice', 'Failed to approve review.');
    res.redirect('/reviews/manage');
  }
};

reviewController.showAllApprovedReviews = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const reviews = await reviewModel.getAllApprovedReviews();
    
    res.render('reviews/all-reviews', {
      title: 'All Approved Reviews',
      nav,
      reviews: reviews.rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = reviewController;