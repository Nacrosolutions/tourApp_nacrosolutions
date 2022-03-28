const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");




exports.createReview = catchAsync(async (req, res) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;

  if (!req.body.user) req.body.user = req.user.id;


  const review = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review
    }
  });



});



exports.getAllReviews = catchAsync(async (req, res) => {

  let filter = {};

  if (req.params.tourId) filter = { tour: req.params.tourId };

  const review = await Review.find(filter);



  res.status(200).json({
    status: 'success',
    results: review.length,
    data: {
      review
    }
  })
});