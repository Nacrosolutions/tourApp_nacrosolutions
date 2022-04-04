const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text')
// new Email(user,url).sendWelcome();
const smtp = require('nodemailer-smtp-transport');



module.exports = class Email {
  constructor(user, url) {
    this.to = user.email,
      this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Nabham Sharma <${process.env.EMAIL_FROM}>`
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {

      //Transporter for send Grid
      const n1 = nodemailer.createTransport(({
        host: "smtp-relay.sendinblue.com",
        port: 587,
        auth: {
          user: 'cu.16bec1004@gmail.com',
          pass: '8NE9AIP5St0Za2rR',

        }
      }))
      return n1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    })

  }

  async send(template, subject) {
    //Send the actual email

    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject

    });



    // 1) Render HTML based on a pug template 


    //2) Define theemail options 


    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    //3) Create a transport and send email 

    await this.newTransport().sendMail(mailOptions)


  }

  async sendWelcome() {
    await this.send('Welcome', 'Welcome to Nacrosolutions Family ! ');
  }


  async sendPasswordReset() {
    await this.send('passwordReset', 'Your password reset token (valid only for 10 minutes')
  }

}


