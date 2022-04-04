
const Tour = require('../models/tourModel');
const AppError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const Booking = require('../models/bookingModel');



exports.getOverview = async (req, res, next) => {


  //1) Get Tour data from collection

  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All tours',
    tours
  });
};

exports.getTour = async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  })


  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
}

exports.getLoginForm = (req, res) => {

  res.status(200).render('login', {
    title: 'Log into your account'
  })

}



exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  })
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  //1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id })



  //2) Find tours with the returned Id

  const toursId = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: toursId } });

  res.status(200).render('overview', {
    title: 'My tours',
    tours
  })
});