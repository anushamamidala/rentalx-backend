const moment = require("moment");
const CONSTANTS = require('../constants/index')

// Gets the days for the particular period
const getDates = (period) => {
  let days = period == CONSTANTS.TODAY ? 1 : period === CONSTANTS.WEEK ? 7 : 30;
  let daysObj = {};
  for (let i = 1; i < days; i++) {
    daysObj[moment().subtract(i, CONSTANTS.DAYS).format("MM/DD")] = 0;
  }
  return daysObj;
};

// Returns data uploaded in 24 hours
const constructTodaysData = (todayDates) => {
  const finalData = {};
  for (let i = 0; i <= 24; i++) {
    let hour = `0${i}`;
    hour = hour.slice(-2);
    finalData[`${hour}:00`] = 0;
  }
  for (let record of todayDates) {
    let currentHour = `0${record}`;
    currentHour = currentHour.slice(-2);
    finalData[`${currentHour}:00`] += 1;
  }
  return finalData;
};

// Formating the returing data to match the data with the chart
const getChartData = (records = [], period) => {
  const todayDates = [];
  let daysObj = getDates(period);
  for (let record of records) {
    if (period === CONSTANTS.TODAY) {
      todayDates.push(
        moment(record ? record.dateUpdated * 1000 : "").format("HH")
      );
    } else {
      const currentDate = moment(
        record ? record.dateUpdated * 1000 : ""
      ).format("MM/DD");
      if (daysObj[currentDate] !== undefined) {
        daysObj[currentDate] += 1;
      }
    }
  }
  if (period === CONSTANTS.TODAY) {
    return constructTodaysData(todayDates);
  }
  return daysObj;
};

// returns the overall data present
const getOverallData = (records) => {
  let daysObj = getDates(CONSTANTS.MONTH);
  for (let record of records) {
    const currentDate = moment(record ? record.dateUpdated * 1000 : "").format(
      "MM/DD"
    );
    if (!daysObj[currentDate]) {
      daysObj[currentDate] = {
        minPrice: [],
        maxPrice: [],
        avgPrice: [],
      };
      if (record.minPrice) {
        daysObj[currentDate].minPrice.push(record.minPrice);
      }
      if (record.maxPrice) {
        daysObj[currentDate].maxPrice.push(record.maxPrice);
      }
      if (record.avgPrice) {
        daysObj[currentDate].avgPrice.push(record.avgPrice);
      }
    } else {
      if (record.minPrice) {
        daysObj[currentDate].minPrice.push(record.minPrice);
      }
      if (record.maxPrice) {
        daysObj[currentDate].maxPrice.push(record.maxPrice);
      }
      if (record.avgPrice) {
        daysObj[currentDate].avgPrice.push(record.avgPrice);
      }
    }
  }
  const allKeys = Object.keys(daysObj);
  for (let key of allKeys) {
    const overAllMinPrice =
      daysObj[key] && daysObj[key].minPrice && daysObj[key].minPrice.length > 0
        ? Math.min(...daysObj[key].minPrice)
        : 0;
    const overAllMaxPrice =
      daysObj[key] && daysObj[key].maxPrice && daysObj[key].maxPrice.length > 0
        ? Math.min(...daysObj[key].maxPrice)
        : 0;
    const overAllAvgPrice =
      daysObj[key] && daysObj[key].avgPrice && daysObj[key].avgPrice.length > 0
        ? Math.min(...daysObj[key].avgPrice)
        : 0;
    let medianPrice = 0;
    if (
      Array.isArray(daysObj[key].avgPrice) &&
      daysObj[key].avgPrice.length > 0
    ) {
      const sortedAvgPrice = daysObj[key].avgPrice.sort(function (a, b) {
        return a - b;
      });
      const midPoint = parseInt(sortedAvgPrice.length / 2);
      if (sortedAvgPrice.length % 2 === 0) {
        medianPrice =
          (sortedAvgPrice[midPoint] + sortedAvgPrice[midPoint - 1]) / 2;
      } else {
        if (sortedAvgPrice.length === 1) {
          medianPrice = sortedAvgPrice[0];
        } else {
          medianPrice = sortedAvgPrice[midPoint];
        }
      }
    }
    daysObj[key] = {
      minPrice: overAllMinPrice,
      maxPrice: overAllMaxPrice,
      avgPrice: overAllAvgPrice,
      medianPrice: medianPrice,
    };
  }
  return daysObj;
};

module.exports = { getChartData, getOverallData };
