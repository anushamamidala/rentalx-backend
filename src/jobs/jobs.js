const schedule = require('node-schedule')
const request = require('request')

const rule = new schedule.RecurrenceRule()
rule.hour = 3
rule.minute = 0

// Scheduled jobs 

const scheduleFetchJob = () => {
  schedule.scheduleJob(rule, function () {
    console.log('Job started')
    request('https://rentalx.herokuapp.com/api/fetch', async function (err, res) {
      console.log('Done', res)
    })
    request('https://rentalx.herokuapp.com/api//fetchViewIt', async function (
      err,
      res
    ) {
      console.log('Done', res)
    })
  })
}

module.exports = {
  scheduleFetchJob
}
