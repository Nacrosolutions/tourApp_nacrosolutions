const User = require("../models/userModal");
const AppError = require("../utils/apiError");
const catchAsync = require("../utils/catchAsync");



const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
}

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();





  // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  })

});


exports.updateMe = async (req, res, next) => {

  //1) Check if is not trying to update thre password

  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not meant for changing the password'), 401);
  }


  //2) FilterObject


  const filterObject = filterObj(req.body, 'name', 'email');


  //3 Update user document

  const updateUser = await User.findByIdAndUpdate(req.user.id, filterObject, {
    runValidators: true,
    new: true
  })


  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser
    }
  });

};


exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });



  res.status(204).json({
    status: 'success'
  })

});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined ....'
  })
};


exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined ....'
  })
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined ....'
  })
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined ....'
  })
};