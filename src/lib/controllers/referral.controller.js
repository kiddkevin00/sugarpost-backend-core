const EmailSender = require('../utility/email-sender');
const Validator = require('../utility/precondition-validator');
const StandardResponseWrapper = require('../utility/standard-response-wrapper');
const constants = require('../constants/');

class UtilityController {

  static sendEmail(req, res) {
    const emailTo = req.body.emailTo;
    const emailFromName = req.user.fullName;

    Validator.shouldNotBeEmpty(emailTo, constants.AUTH.ERROR_NAMES.EMAIL_TO_IS_EMPTY);
    Validator.shouldNotBeEmpty(emailFromName, constants.AUTH.ERROR_NAMES.EMAIL_FROM_NAME_IS_EMPTY);

    const emailSender = new EmailSender('Gmail', 'administrator@mysugarpost.com');
    const from = `"${emailFromName}" <administrator@mysugarpost.com>`;
    const to = emailTo;
    const subject = 'Enjoy Sugarpost with 10% Off Your First Month\'s Subscription';
    const html = `
          <div>
              <p>Hi,</p>
              <p>
                Here is a 10% discount off your first month of Sugarpost’s premium dessert 
                subscription service! To claim your discount, sign up now and enter the 
                following referral code in the payment page: ${req.user.referralCode} or 
                click the link below:
              </p>
              <p>https://www.mysugarpost.com/register/signup?refer_code=${req.user.referralCode}</p>
              <br />
              <p>Enjoy your dessert,</p>
              <p>${emailFromName}</p>
           </div>
        `;

    return emailSender.sendMail(from, to, subject, html)
      .then((info) => {
        // [TODO] Replace with logger module.
        console.log('Forgot-password email message %s sent: %s', info.messageId, info.response);

        const response = new StandardResponseWrapper([{ success: true }],
          constants.SYSTEM.RESPONSE_NAMES.EMAIL_REFERRAL);

        return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK)
          .json(response.format);
      });
  }

}

module.exports = exports = UtilityController;
