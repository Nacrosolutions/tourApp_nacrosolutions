const Review = require("../models/reviewModel");
// const catchAsync = require("../utils/catchAsync");

const factory = require('./handleFactory');

exports.setTouruserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;

  if (!req.body.user) req.body.user = req.user.id;
  next();
}

exports.createReview = factory.createOne(Review);
exports.getAllReviews = factory.getAll(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.getReview = factory.getOne(Review);