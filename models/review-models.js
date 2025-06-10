const pool = require('../database/');

const reviewModel = {
  async addReview(inv_id, account_id, review_text, review_rating) {
    try {
      const sql = `INSERT INTO reviews 
        (inv_id, account_id, review_text, review_rating) 
        VALUES ($1, $2, $3, $4) RETURNING *`;
      return await pool.query(sql, [inv_id, account_id, review_text, review_rating]);
    } catch (error) {
      console.error("Error adding review:", error);
      throw error;
    }
  },

  async getApprovedReviews(inv_id) {
    try {
      const sql = `SELECT r.*, a.account_firstname, a.account_lastname 
        FROM reviews r JOIN account a ON r.account_id = a.account_id
        WHERE r.inv_id = $1 AND r.is_approved = true
        ORDER BY r.review_date DESC`;
      return await pool.query(sql, [inv_id]);
    } catch (error) {
      console.error("Error getting approved reviews:", error);
      throw error;
    }
  },

  async getPendingReviews() {
    try {
      const sql = `SELECT r.*, i.inv_make, i.inv_model 
        FROM reviews r JOIN inventory i ON r.inv_id = i.inv_id
        WHERE r.is_approved = false`;
      return await pool.query(sql);
    } catch (error) {
      console.error("Error getting pending reviews:", error);
      throw error;
    }
  },

  async approveReview(review_id) {
    try {
      const sql = `UPDATE reviews SET is_approved = true WHERE review_id = $1`;
      return await pool.query(sql, [review_id]);
    } catch (error) {
      console.error("Error approving review:", error);
      throw error;
    }
  }
};

module.exports = reviewModel;