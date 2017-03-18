const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

class EmailSender {

  constructor(senderService, senderEmail, senderPassword) {
    this.transporter = nodemailer.createTransport(smtpTransport({
      service: senderService,
      auth: {
        user: senderEmail,
        pass: senderPassword,
      },
    }));
  }

  sendMail(from, to, subject, html) {
    return new Promise((resolve, reject) => {
      this.transporter.sendMail({ from, to, subject, html }, (err, info) => {
        if (err) {
          return reject(err);
        }
        return resolve(info);
      });
    });
  }

}

module.exports = exports = EmailSender;
