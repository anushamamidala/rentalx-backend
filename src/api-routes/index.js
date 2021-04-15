const express = require('express')
const router = express.Router()
const db = require('../db')
const { fetchViewItData } = require('../viewit/view_it')
const { fetchPadMapperData } = require('../pad-mapper/pad-mapper')
const { getChartData, getOverallData } = require('../utils/chart-helper')
require('dotenv/config')
const CONSTANTS = require('../constants/index')

const routes = dbCollection => {
  // Method : POST
  // Endpoint : BASE_URL/api/listings-count
  // body params
  // cityName: Optional | Type: String | Values: ["Toronto", "Ottawa", "Vancouver"]
  router.post('/listings-count', async (request, response) => {
    const cityName = request.body.cityName
    const noOfBedrooms = request.body.noOfBedrooms
    const zipCode = request.body.zipCode
    const unitType = request.body.unitType
    let periods = CONSTANTS.PERIODS
    let result = {
      listings_count: {},
      chart_data: {}
    }
    for (let period of periods) {
      let days =
        period == CONSTANTS.TODAY ? 1 : period == CONSTANTS.WEEK ? 7 : 30
      let matchDate =
        new Date(Date.now() - days * CONSTANTS.ONE_DAY).getTime() / 1000
      let findObj = {
        dateUpdated: {
          $gt: Math.floor(matchDate)
        }
      }
      if (cityName) {
        findObj.city = cityName
      }
      if (noOfBedrooms > 0) {
        findObj.bedsRange = { $in: [+noOfBedrooms] }
      }
      if (unitType) {
        findObj.propertyType = unitType
      }
      if (zipCode) {
        const postalCode =
          zipCode.trim().toUpperCase().length === 3
            ? zipCode.trim().toUpperCase()
            : zipCode
                .trim()
                .toUpperCase()
                .slice(0, 3)
        findObj.postalCode = { $regex: '.*' + postalCode + '.*' }
      }
      let padMapperListings = await dbCollection
        .find(findObj, { bedsRange: 1 })
        .toArray()
      result.listings_count[period] = padMapperListings.length
      const chartData = getChartData(padMapperListings, period)
      result.chart_data[period] = chartData
      result.overall_data = getOverallData(padMapperListings)
    }
    response.send(result)
  })

  // Method : POST
  // Endpoint : BASE_URL/api/listings-price
  router.post('/listings-price', async (request, response) => {
    const cityName = request.body.cityName
    const noOfBedrooms = request.body.noOfBedrooms
    const zipCode = request.body.zipCode
    const unitType = request.body.unitType
    let matchDate =
      new Date(Date.now() - 30 * CONSTANTS.ONE_DAY).getTime() / 1000
    let findObj = {
      dateUpdated: {
        $gt: Math.floor(matchDate)
      },
      minPrice: {
        $gt: 1
      }
    }
    if (cityName) {
      findObj.city = cityName
    }
    if (noOfBedrooms > 0) {
      findObj.bedsRange = { $in: [+noOfBedrooms] }
    }
    if (unitType) {
      findObj.propertyType = unitType
    }
    if (zipCode) {
      const postalCode =
        zipCode.trim().toUpperCase().length === 3
          ? zipCode.trim().toUpperCase()
          : zipCode
              .trim()
              .toUpperCase()
              .slice(0, 3)
      findObj.postalCode = { $regex: '.*' + postalCode + '.*' }
    }
    const result = await dbCollection
      .aggregate([
        {
          $match: findObj
        },
        {
          $group: {
            _id: '$city',
            average: { $avg: '$avgPrice' },
            maximum: { $max: '$maxPrice' },
            minimum: { $min: '$minPrice' }
          }
        }
      ])
      .toArray()
    response.send(result)
  })

  router.post('/listings-count-avg', async (request, response) => {
    const cityName = request.body.cityName
    const noOfBedrooms = request.body.noOfBedrooms
    const zipCode = request.body.zipCode
    const unitType = request.body.unitType
    let result = {
      overall_data: []
    }

    let findObj = {
      minPrice: {
        $gt: 1
      }
    }
    if (cityName) {
      findObj.city = cityName
    }
    if (noOfBedrooms > 0) {
      findObj.bedsRange = { $in: [+noOfBedrooms] }
    }
    if (unitType) {
      findObj.propertyType = unitType
    }
    if (zipCode) {
      const postalCode =
        zipCode.trim().toUpperCase().length === 3
          ? zipCode.trim().toUpperCase()
          : zipCode
              .trim()
              .toUpperCase()
              .slice(0, 3)
      findObj.postalCode = { $regex: '.*' + postalCode + '.*' }
    }
    let padMapperListings = await dbCollection
      .aggregate([
        {
          $match: findObj
        },
        {
          $group: {
            _id: {
              year: {
                $year: {
                  $add: [new Date(0), { $multiply: [1000, '$dateUpdated'] }]
                }
              },
              month: {
                $month: {
                  $add: [new Date(0), { $multiply: [1000, '$dateUpdated'] }]
                }
              }
            },
            average: { $avg: '$avgPrice' }
          }
        }
      ])
      .toArray()
    result.overall_data = padMapperListings
    response.send(result)
  })

  router.post('/listings-count-prop-type', async (request, response) => {
    const cityName = request.body.cityName
    const noOfBedrooms = request.body.noOfBedrooms
    const zipCode = request.body.zipCode
    const unitType = request.body.unitType
    let result = {
      overall_data: []
    }

    let findObj = {
      minPrice: {
        $gt: 1
      }
    }
    if (cityName) {
      findObj.city = cityName
    }
    if (noOfBedrooms > 0) {
      findObj.bedsRange = { $in: [+noOfBedrooms] }
    }
    if (unitType) {
      findObj.propertyType = unitType
    }
    if (zipCode) {
      const postalCode =
        zipCode.trim().toUpperCase().length === 3
          ? zipCode.trim().toUpperCase()
          : zipCode
              .trim()
              .toUpperCase()
              .slice(0, 3)
      findObj.postalCode = { $regex: '.*' + postalCode + '.*' }
    }
    let padMapperListings = await dbCollection
      .aggregate([
        {
          $match: findObj
        },
        {
          $group: {
            _id: '$propertyType',
            average: { $avg: '$avgPrice' }
          }
        }
      ])
      .toArray()
    result.overall_data = padMapperListings
    response.send(result)
  })

  // Fetch will get all the records from the padmapper, viewIt and rentals
  // This is called in the jobs scheduler to fetch the data
  router.get('/fetch', (req, res) => {
    let data = fetchPadMapperData(dbCollection)
    res.send(data)
    let data_viewIt = fetchViewItData(dbCollection)
    res.send(data_viewIt)
  })
}

const databaseNotConnected = () => {
  console.log('Database connection failed')
}

db.initialize(
  process.env.DATABASE_NAME,
  process.env.RENTALS_COLLECTION_NAME,
  routes,
  databaseNotConnected
)

module.exports = router
