
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/apiError');
const factory = require('./handleFactory');
const sharp = require('sharp');
const multer = require('multer');


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




const multerStorage = multer.memoryStorage();



const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);

  }
  else {
    cb(new AppError('Not an image ! pleaseupload ony image', 400), false);
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});


exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);



exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files.imageCover);

  if (!req.files.imageCover || !req.files.images) return next();



  //1) cover Images Process
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`

  await sharp(req.files.imageCover[0].buffer).resize(2000, 1333).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/tours/${req.body.imageCover}`);




  //3 Images
  req.body.images = [];
  await Promise.all(req.files.images.map(async (file, i) => {
    const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
    await sharp(file.buffer).resize(2000, 1333).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/tours/${filename}`);
    req.body.images.push(filename)

  })
  );
  next();
});




exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,difficulty,summary';

  next();
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




exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour)


exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);


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



exports.getTourWithIn = catchAsync(async (req, res, next) => {
  // 34°07'45.7"N 118°09'52.5"

  const { distance, lating, unit } = req.params;

  const [lat, lng] = lating.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    return next(new AppError('The Lat and Longitude are not defined . Please Providein format lat ,lng', 400))
  }

  console.log(distance, lat, lng, unit);

  //Geospatial query


  const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } })

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  })


});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  // 34.1117, -118.113
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      },
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }


  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances
    }
  });
});
