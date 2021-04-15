const schedule = require('node-schedule')
const request = require('request')
const { sendEmailOnError } = require('./email')

// Scheduled jobs

const scheduleFetchJob = () => {
  console.log('JOB STARTED')
  schedule.scheduleJob('0 2 * * *', function () {
    console.log('JOB STARTED at----')
    request('https://rentalx.herokuapp.com/api/fetch', async function (
      err,
      res
    ) {
      console.log('res err', res, err)
      if (res) {
        console.log(res)
        sendEmailOnError('Success', JSON.stringify(res))
      }
      if (err) {
        console.log(err)
        sendEmailOnError('Error', JSON.stringify(err))
      }
    })
    request('https://rentalx.herokuapp.com/api/fetchViewIt', async function (
      err,
      res
    ) {
      if (res) {
        sendEmailOnError('Success', JSON.stringify(res))
      }
      if (err) {
        sendEmailOnError('Error', JSON.stringify(err))
      }
    })
  })
}

module.exports = {
  scheduleFetchJob
}
