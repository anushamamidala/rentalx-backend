const nodemailer = require('nodemailer')

const sendEmailOnError = async (subj, text) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'project.test.net@gmail.com',
      pass: 'Test.Net123456'
    }
  })

  let mailOptions = {
    from: 'project.test.net@gmail.com',
    to: 'project.test.net@gmail.com',
    subject: subj,
    text: text,
    html: '<b>' + text + '</b>'
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}

module.exports = {
  sendEmailOnError
}
