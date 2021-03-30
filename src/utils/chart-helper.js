const moment = require('moment')

const getDates = period => {
  let days = period == 'today' ? 1 : period === 'week' ? 7 : 30
  let daysObj = {}
  for (let i = 1; i < days; i++) {
    daysObj[
      moment()
        .subtract(i, 'days')
        .format('MM/DD')
    ] = 0
  }
  return daysObj
}

const constructTodaysData = todayDates => {
  const finalData = {}
  for (let i = 0; i <= 24; i++) {
    let hour = `0${i}`
    hour = hour.slice(-2)
    finalData[`${hour}:00`] = 0
  }
  for (let record of todayDates) {
    let currentHour = `0${record}`
    currentHour = currentHour.slice(-2)
    finalData[`${currentHour}:00`] += 1
  }
  return finalData
}

const getChartData = (records = [], period) => {
  const todayDates = []
  let daysObj = getDates(period)
  for (let record of records) {
    if (period === 'today') {
      todayDates.push(
        moment(record ? record.dateUpdated * 1000 : '').format('HH')
      )
    } else {
      const currentDate = moment(
        record ? record.dateUpdated * 1000 : ''
      ).format('MM/DD')
      if (daysObj[currentDate] !== undefined) {
        daysObj[currentDate] += 1
      }
    }
  }
  if (period === 'today') {
    return constructTodaysData(todayDates)
  }
  return daysObj
}

const getOverallData = records => {
  let daysObj = getDates('month')
  for (let record of records) {
    const currentDate = moment(record ? record.dateUpdated * 1000 : '').format(
      'MM/DD'
    )
    if (!daysObj[currentDate]) {
      daysObj[currentDate] = {
        minPrice: [],
        maxPrice: [],
        avgPrice: []
      }
      if (record.minPrice) {
        daysObj[currentDate].minPrice.push(record.minPrice)
      }
      if (record.maxPrice) {
        daysObj[currentDate].maxPrice.push(record.maxPrice)
      }
      if (record.avgPrice) {
        daysObj[currentDate].avgPrice.push(record.avgPrice)
      }
    } else {
      if (record.minPrice) {
        daysObj[currentDate].minPrice.push(record.minPrice)
      }
      if (record.maxPrice) {
        daysObj[currentDate].maxPrice.push(record.maxPrice)
      }
      if (record.avgPrice) {
        daysObj[currentDate].avgPrice.push(record.avgPrice)
      }
    }
  }
  const allKeys = Object.keys(daysObj)
  for (let key of allKeys) {
    const overAllMinPrice =
      daysObj[key] && daysObj[key].minPrice && daysObj[key].minPrice.length > 0
        ? Math.min(...daysObj[key].minPrice)
        : 0
    const overAllMaxPrice =
      daysObj[key] && daysObj[key].minPrice && daysObj[key].maxPrice.length > 0
        ? Math.min(...daysObj[key].maxPrice)
        : 0
    const overAllAvgPrice =
      daysObj[key] && daysObj[key].minPrice && daysObj[key].avgPrice.length > 0
        ? Math.min(...daysObj[key].avgPrice)
        : 0
    daysObj[key] = {
      minPrice: overAllMinPrice,
      maxPrice: overAllMaxPrice,
      avgPrice: overAllAvgPrice
    }
  }
  return daysObj
}

module.exports = { getChartData, getOverallData }
