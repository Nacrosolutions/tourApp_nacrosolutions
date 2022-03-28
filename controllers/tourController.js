
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/APIFeatures');
const AppError = require('../utils/apiError');

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));


// exports.checkId = (req, res, next, value) => {

//   if (+req.params.id > tours.length) {

//     return res.status(404).json({
//       status: 'Failed',
//       message: 'Invalid id'
//     })

//   }
//   next();
//   ;
// }

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,difficulty,summary';

  next();
};





exports.getAllTours = async (req, res) => {



  try {

    //EXECUTE QUERY 

    const features = new APIFeatures(Tour.find(), req.query).filter().sorting().limitFields().paginate();
    // console.log(features);
    const tours = await features.query;





    // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    })
  }
  catch (error) {
    res.status(404).json({
      status: 'Failed',
      message: error

    })
  }
};


// exports.getTour = catchAsync(async (req, res, next) => {

//   const tours = await Tour.findById(req.params.id, err => {
//     if (err) {
//       return next(new AppError('No id found in DB', 404))

//     }
//   });



//   // if (!tours) {
//   //   return next(new AppError('No id found in DB', 404))
//   // }
//   // const id = req.params.id * 1;
//   // if (id > tours.length) {
//   //   return res.status(404).json({
//   //     status: 'Failed',
//   //     message: 'Invalid id'
//   //   })
//   // }


//   // const tour = tours.find(el => el.id === id);


//   // const tourById = tours[req.params.id];
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours
//     }
//   })

// });


exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');

  if (!tour) {
    return next(new AppError('No tour found with that id', 404))
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }

  })
})


exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  })



});


exports.updateTour = catchAsync(async (req, res) => {

  const tours = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
  res.status(200).json({
    status: 'success',
    data: {
      tours
    }
  })


});


exports.deleteTour = catchAsync(async (req, res, next) => {



  const tours = await Tour.findByIdAndDelete(req.params.id, err => {
    if (err) {
      return next(new AppError('No id found in DB', 404))

    }
  });


  res.status(200).json({
    status: 'success',
    data: {
      tours: null
    }
  })

});



exports.getTourStats = catchAsync(async (req, res) => {


  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $min: '$price' }

      },

    },
    {
      $sort: { avgPrice: 1 }
    },

    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  })



});



exports.getMonthlyPlan = catchAsync(async (req, res) => {

  const year = req.params.year * 1;

  const plans = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)

        }
      }

    },
    {
      $group: {
        _id: {
          $month: '$startDates'
        },
        numTourStarts: { $sum: 1 },
        tours: {
          $push: '$name'
        }
      },

    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: {
        numTourStarts: -1
      }
    },
    {
      $limit: 12

    }
  ])

  res.status(200).json({
    status: 'success',
    data: {
      plans
    }
  })



});