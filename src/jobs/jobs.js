const schedule = require("node-schedule");
const request = require("request");

const rule = new schedule.RecurrenceRule();
rule.hour = 3;
rule.minute = 0;

const scheduleFetchJob = () => {
  schedule.scheduleJob(rule, function () {
    console.log("Job started");
    request("http://localhost:4000/api/fetch", async function (err, res) {
      console.log("Done", res);
      console.log("Job ended");
    });
    request("http://localhost:4000/api//fetchViewIt", async function (err, res) {
      console.log("Done", res);
      console.log("Job ended");
    });
  });
};

module.exports = {
  scheduleFetchJob
};
