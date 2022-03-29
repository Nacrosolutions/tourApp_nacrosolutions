
const mongoose = require('mongoose');
const slugify = require('slugify')
// const validator = require('validator');
// const User = require('./userModal');



const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'A tour must have the max Length of 40'],
    minlength: [10, ' A tour should have the min length of 10']
  },

  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A schema must have a group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either : easy,medium or hard'
    }
  },

  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'A tour must have minimum rating (1)'],
    max: [5, 'A tour must not be greater than (5)'],
    set: val => Math.round(val * 10) / 10
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price
      },
      message: 'Discount price {{VALUE}} should be below regular price'
    }
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour musthave a decription']
  },
  description: {
    type: String,
    trim: true
  },

  imageCover: {
    type: String,
    required: [true, 'A true must have a cover images']
  },

  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  },

  startLocation: {
    // GeoJSON
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
},

  { toJSON: { virtuals: true } }, {
  toObject: { virtuals: true }
});

// tourSchema.index({ price: 1 })
tourSchema.index({ price: 1, ratingsAverage: -1 })
tourSchema.index({ slug: 1 })
tourSchema.index({ 'startLocation': '2dsphere' })


tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//This is virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
})

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
})

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});


//-------------------------EMBEDING--------------------------
// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async id => await User.findById(id))
//   this.guides = await Promise.all(guidesPromise)
//   next();
// })

//-------------------------------------------------------------------------------------------------------------





// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// })



//QueryMiddleware

tourSchema.pre(/^find/, (function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
}));


tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});



//Aggregration pipeLine 
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })

//   next();
// })

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;