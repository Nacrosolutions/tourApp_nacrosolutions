const User = require("../models/userModal");
const AppError = require("../utils/apiError");
const catchAsync = require("../utils/catchAsync");
const factory = require('./handleFactory');
const sharp = require('sharp');
const multer = require('multer');


// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   }
//   ,
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// })


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


exports.uploadUserPhoto = upload.single('photo');



exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
  await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`)

  next();

}


const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
}


exports.updateMe = async (req, res, next) => {

  //1) Check if is not trying to update thre password

  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not meant for changing the password'), 401);
  }


  //2) FilterObject


  const filterObject = filterObj(req.body, 'name', 'email');

  if (req.file) {
    filterObject.photo = req.file.filename
  }


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


exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
}


exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });



  res.status(204).json({
    status: 'success'
  })

});



exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined .... Plese use signup instead'
  })
};


exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);