const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
process.on('uncaughtException', err => {
  console.log('Uncaught Exception 🔥🎆 Shutting down ..');
  console.log(err.name, err.message);
  process.exit(1);

})
dotenv.config({ path: './config.env' })
const app = require('./app');
console.log(app.get('env'));

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true

}).then(() => {
  console.log('DB connection successful')
})



const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on the ${port}...`);

});


process.on('unhandledRejection', err => {
  console.log('Unhandled rejection 🔥🎆 Shutting down ..');
  console.log(err.name, err.message);

  const now = new Date(Date.now());
  fs.appendFileSync('./log.txt', `${now.toUTCString()} - ${err}\n`, 'utf-8');
  server.close(() => {
    process.exit(1);

  })
});


