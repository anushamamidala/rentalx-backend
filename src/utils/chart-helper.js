const moment = require("moment");

const getDates = (period) => {
  let days = period == "today" ? 1 : period === "week" ? 7 : 30;
  let daysObj = {};
  for (let i = 0; i < days; i++) {
    daysObj[moment().subtract(i, "days").format("MM/DD")] = 0;
  }
  return daysObj;
};

const getChartData = (records = [], period) => {
  let daysObj = getDates(period);
  for (let record of records) {
    const currentDate = moment(record ? record.dateUpdated * 1000 : "").format(
      "MM/DD"
    );
    if (daysObj[currentDate] !== undefined) {
      daysObj[currentDate] += 1;
    }
  }
  return daysObj;
};

module.exports = { getChartData };
