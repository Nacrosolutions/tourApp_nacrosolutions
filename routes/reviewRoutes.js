const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const router = express.Router({ mergeParams: true });


// router.post('/', reviewController.createReview);
// router.get('/getReview', reviewController.getAllReviews);



router.use(authController.protect);
router.route('/').get(reviewController.getAllReviews).post(authController.protect, authController.restrictTo('user'),
  reviewController.setTouruserId, reviewController.createReview);

// router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

router.route('/:id')
  .get(reviewController.getReview)
  .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview).patch(authController.restrictTo('user', 'admin'), reviewController.updateReview);
module.exports = router;