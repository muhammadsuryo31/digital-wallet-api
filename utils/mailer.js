const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "dd2d54a8d269d2",
      pass: "463913a83eb880",
    },
  });

  const mailOptions = {
    from: "the.wallet@mail.com",
    to: options.email,
    subject: options.subject,
    text: options.message
  }

  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
