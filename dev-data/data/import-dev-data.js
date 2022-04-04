const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModal');

const Reviews = require('../../models/reviewModel');

dotenv.config({ path: './config.env' })




const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true

}).then(() => {
  console.log('DB connection successful');
})
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));



const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Reviews.create(reviews);


    // console.log('Data succesfully loaded!!');
  }
  catch (err) {
    console.log(err)
  }
  process.exit();
}
// Delete all Data fromm collection

const deleteData = async () => {
  try {

    await Tour.deleteMany({});
    await User.deleteMany({});

    await Reviews.deleteMany({});

    console.log('Data delete Successully !!!');


  }

  catch (err) {
    console.log(err);
  }
  process.exit();
}

if (process.argv[2] === '--import') {
  importData();
}
else if (process.argv[2] === '--delete') {
  deleteData();
}


console.log(process.argv);




