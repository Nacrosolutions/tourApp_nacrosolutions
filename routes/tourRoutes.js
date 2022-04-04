
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

// router.route('/:tourId/reviews').post(authController.protect, authController.restrictTo('user'), reviewController.createReview);



router.use('/:tourId/reviews', reviewRouter);
// router.param('id', tourController.checkId);

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/tour-plan/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);

// /tours-within/233/center/34.1117,-118.113/unit/miles


router.route('/tours-within/:distance/center/:lating/unit/:unit').get(tourController.getTourWithIn)


router.route('/distance/:latlng/unit/:unit').get(tourController.getDistances)



router.route('/').get(tourController.getAllTours).post(tourController.createTour, authController.protect,
  authController.restrictTo('admin', 'lead-guide'));

router.route('/:id').get(tourController.getTour).patch(authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  tourController.uploadTourImages,
  tourController.resizeTourImages,
  tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour);


// tour/id/reviews


// router.route('/:tourId/reviews').post(authController.protect, authController.restrictTo('user'), reviewController.createReview);

module.exports = router;
