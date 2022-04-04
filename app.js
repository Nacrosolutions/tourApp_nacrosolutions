const path = require('path');
const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const reviewRouter = require('./routes/reviewRoutes')
const AppError = require('./utils/apiError');
const errorController = require('./controllers/errorController');
const bookingRouter = require('./routes/bookingRoutes');
const compression = require('compression');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');
const hpp = require('hpp');
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))


//Body parser



//1) middleWARES
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));


//Security HTTTP Header 
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://*.cloudflare.com',
  'https://js.stripe.com/v3/',
  'https://checkout.stripe.com'
];
const styleSrcUrls = [
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
  'https://www.myfonts.com/fonts/radomir-tinkov/gilroy/*',
  ' checkout.stripe.com'];
const connectSrcUrls = [
  'https://*.mapbox.com/',
  'https://*.cloudflare.com',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:52191',
  '*.stripe.com'

];

const fontSrcUrls = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:'],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ['*.stripe.com',
        '*.stripe.network']
    },
  })
);
// ************* Rate Lmiter ****************
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this ip . Try again in an hour'

});

app.use(express.static(path.join(__dirname, 'public')))
app.use('/api', limiter);
// ********************************

//Body parser
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

//Data Sanitization against NoSQl Query Injection

app.use(mongoSanitize());

//Data  Sanitization against XSS
app.use(xss());

//Prevet hpp pollution
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsAverage',
    'ratingsQuantity',
    'maxGroupSize',
    'diificulty',
    'price'
  ]
}));


app.use(compression());

app.use((req, res, next) => {
  next();
});




app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});




//rOUTE hANDLERS




// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//3 Router




app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/bookings', bookingRouter)


app.all('*', (req, res, next) => {

  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find the ${req.originalUrl} in server`
  // })
  // next();




  next(new AppError(`Can't find the ${req.originalUrl} in server`, 404));


});


//Global errro handling middleware

app.use(errorController);


module.exports = app;