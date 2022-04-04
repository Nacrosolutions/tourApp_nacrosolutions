const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { promisify } = require('util');
const User = require('../models/userModal');
const AppError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');



const signToken = id => {
  return jwt.sign({
    id
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,

  })
};


const createSendToken = (user, statusCode, res) => {

  const token = signToken(user._id);
  const cookieOption = {

    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true

  }

  if ((process.env.NODE_ENV === 'production')) cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);
  user.password = undefined

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
}



exports.signUp = catchAsync(async (req, res, err, next) => {

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);


});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;


  //1) check if email and paswwor  exist

  if (!email || !password) {
    return next(new AppError('Please enter a email and password', 400))
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || ! await user.corectPassword(password, user.password)) {
    return next(new AppError('Incorrect email or password', 401))
  }

  createSendToken(user, 200, res)

});



exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })

  res.status(200).json({
    status: 'success'
  })
}

exports.protect = catchAsync(async (req, res, next) => {

  //1) Getting a token and check if its there
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }
  else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }


  if (!token) {
    return next(new AppError('You are not logged in ~!', 401))
  }
  //2) Verification a jwt

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)


  // console.log(decoded)

  //3) Check if user still exist or not ?

  const freshUser = await User.findById(decoded.id)
  if (!freshUser) {
    return next(new AppError('The user belonging to the user does no longer exist', 401))
  }

  //4) If user changed password after the jwt is issued 

  //instance method 
  // console.log(decoded.iat)


  if (freshUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed the password ! Pleas login again', 401))
  }

  //Grant access to protected Route

  req.user = freshUser;
  res.locals.user = freshUser;

  next();



});





//Only For rendered Pages and there will be no error
exports.isLoggedIn = async (req, res, next) => {
  try {



    if (req.cookies.jwt) {

      //Verfies the Token 
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)


      // console.log(decoded)

      //3) Check if user still exist or not ?

      const freshUser = await User.findById(decoded.id)
      if (!freshUser) {
        return next();
      }

      //4) If user changed password after the jwt is issued 

      //instance method 
      // console.log(decoded.iat)


      if (freshUser.changePasswordAfter(decoded.iat)) {
        return next();
      }
      //There is logged in user
      res.locals.user = freshUser;

      return next();
    }
  } catch (err) {
    return next();
  }
  next();


};




exports.restrictTo = (...roles) => {

  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You dont have permission to perform this action', 403))
    }
    next();
  }

};



exports.forgotPassword = catchAsync(async (req, res, next) => {

  //Get user based on Posted email

  const user = await User.findOne({ email: req.body.email })


  if (!user) {
    return next(new AppError('There is no user with email address', 404))
  }
  //2Generate the random reset token 

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false })
  //3 Send it to the user's email

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;

  const message = `Forgot Your password?  Submit a Patch request with your new password and passwordConfirm to ${resetURL}.
   If you don't ignore the message`

  try {
    // await sendMail({
    //   email: user.email,
    //   subject: 'Your password reset Token valid for 10 minutes',
    //   message
    // });await


    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token send to email !'
    })

  }
  catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false })

    return next(new AppError('There was a error in sending a email . Try again later', 500))

  }
}
)

exports.resetPassword = catchAsync(async (req, res, next) => {

  //1 get User based on the token 

  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });


  //2) Set ht enewPassword if token i not expired and user is there
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400))
  }

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3) Update changePasswordAt property for the user

  //4) Log the user in , send jwt
  createSendToken(user, 200, res)

});

exports.updatePassword = async (req, res, next) => {
  //1 ) Gt user from the collection

  const user = await User.findById(req.user.id).select('+password');

  //2) If posted password is correct 

  if (!(await user.corectPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong'), 401);
  }


  //3) If so ,update the password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();


  //4) Log the user again ,send json token 
  createSendToken(user, 200, res)

}