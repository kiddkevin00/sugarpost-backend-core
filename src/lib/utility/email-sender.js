const nodemailer = require('nodemailer');

class EmailSender {

  constructor(senderService, senderEmail) {
    this.transporter = nodemailer.createTransport('SMTP', ({
      service: senderService,
      auth: {
        XOAuth2: {
          user: senderEmail,
          clientId: '572537695908-o1iucehpbk5kn5cqndtlocrq24amti1u.apps.googleusercontent.com',
          clientSecret: 'KOYpGrs16BnuFgyJCvsv7iDz',
          refreshToken: '1/VluYqdGtLCMUppQJI6C9qxgLkmgKCv5L6_eTXPp3ETk',
        },
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
