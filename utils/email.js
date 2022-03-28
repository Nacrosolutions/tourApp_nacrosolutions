const nodemailer = require('nodemailer');

const sendMail = async options => {
  // 1) Transporter is a service
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  //2 ) email options

  const mailOptions = {
    from: 'Nabham Sharma <nnssuser@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  }

  //3) Send an email through nodemailer
  await transporter.sendMail(mailOptions)
}

module.exports = sendMail;