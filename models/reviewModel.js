const mongoose = require('mongoose');



const reviewSchema = new mongoose.Schema({


  review: {
    type: String,
    required: [true, 'A review can not be empty']

  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },

  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to the tour']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'review must belong to the user']
  }


}, { toJSON: { virtuals: true } }, {
  toObject: { virtuals: true }
})

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  })
  next();
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;