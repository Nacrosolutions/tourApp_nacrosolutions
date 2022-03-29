const path = require('path');
const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes')
const AppError = require('./utils/apiError');
const errorController = require('./controllers/errorController');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))


//Body parser



//1) middleWARES
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));


//Security HTTTP Header 
app.use(helmet());
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




app.use((req, res, next) => {
  console.log('This is second middelWare');
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


app.get('/', (req, res) => {
  res.status(200).render('base');
})




app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/review', reviewRouter);


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