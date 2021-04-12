const express = require("express");
const router = express.Router();
const db = require("../db");
const { fetchViewItData } = require("../viewit/view_it");
const { fetchPadMapperData } = require("../pad-mapper/pad-mapper");
const { getChartData, getOverallData } = require("../utils/chart-helper");
require("dotenv/config");

const routes = (dbCollection) => {
  // Method : POST
  // Endpoint : BASE_URL/api/listings-count
  // body params
  // cityName: Optional | Type: String | Values: ["Toronto", "Ottawa", "Vancouver"]
  router.post("/listings-count", async (request, response) => {
    const cityName = request.body.cityName;
    const noOfBedrooms = request.body.noOfBedrooms;
    const zipCode = request.body.zipCode;
    const unitType = request.body.unitType;
    let periods = ["today", "week", "month"];
    let result = {
      listings_count: {},
      chart_data: {},
    };
    for (let period of periods) {
      let ONE_DAY = 24 * 60 * 60 * 1000;
      let days = period == "today" ? 1 : period == "week" ? 7 : 30;
      let matchDate = new Date(Date.now() - days * ONE_DAY).getTime() / 1000;
      let findObj = {
        dateUpdated: {
          $gt: Math.floor(matchDate),
        },
      };
      if (cityName) {
        findObj.city = cityName;
      }
      if (noOfBedrooms > 0) {
        findObj.bedsRange = { $in: [+noOfBedrooms] };
      }
      if (unitType) {
        findObj.propertyType = unitType;
      }
      if (zipCode) {
        const postalCode =
          zipCode.trim().toUpperCase().length === 3
            ? zipCode.trim().toUpperCase()
            : zipCode.trim().toUpperCase().slice(0, 3);
        findObj.postalCode = { $regex: ".*" + postalCode + ".*" };
      }
      let padMapperListings = await dbCollection
        .find(findObj, { bedsRange: 1 })
        .toArray();
      result.listings_count[period] = padMapperListings.length;
      const chartData = getChartData(padMapperListings, period);
      result.chart_data[period] = chartData;
      result.overall_data = getOverallData(padMapperListings);
    }
    response.send(result);
  });

  // Method : POST
  // Endpoint : BASE_URL/api/listings-price
  router.post("/listings-price", async (request, response) => {
    let ONE_DAY = 24 * 60 * 60 * 1000;
    const cityName = request.body.cityName;
    const noOfBedrooms = request.body.noOfBedrooms;
    const zipCode = request.body.zipCode;
    const unitType = request.body.unitType;
    let matchDate = new Date(Date.now() - 30 * ONE_DAY).getTime() / 1000;
    let findObj = {
      dateUpdated: {
        $gt: Math.floor(matchDate),
      },
    };
    if (cityName) {
      findObj.city = cityName;
    }
    if (noOfBedrooms > 0) {
      findObj.bedsRange = { $in: [+noOfBedrooms] };
    }
    if (unitType) {
      findObj.propertyType = unitType;
    }
    if (zipCode) {
      const postalCode =
        zipCode.trim().toUpperCase().length === 3
          ? zipCode.trim().toUpperCase()
          : zipCode.trim().toUpperCase().slice(0, 3);
      findObj.postalCode = { $regex: ".*" + postalCode + ".*" };
    }
    const result = await dbCollection
      .aggregate([
        {
          $match: findObj,
        },
        {
          $group: {
            _id: "$city",
            average: { $avg: "$avgPrice" },
            maximum: { $max: "$maxPrice" },
            minimum: { $min: "$minPrice" },
          },
        },
      ])
      .toArray();
    response.send(result);
  });

  // MARK: To be replaced with agenda
  router.get("/fetch", (req, res) => {
    
   let data = fetchPadMapperData(dbCollection);
    res.send(data);
   let data_viewIt = fetchViewItData(dbCollection);
    res.send(data_viewIt);
  });

  // router.get("/fetchViewIt", (req, res) => {
  //   let data = fetchViewItData(dbCollection);
  //   res.send(data);
  // });
};

const databaseNotConnected = () => {
  console.log("Database connection failed");
};

db.initialize(
  process.env.DATABASE_NAME,
  process.env.PAD_MAPPER_COLLECTION_NAME,
  routes,
  databaseNotConnected
);

module.exports = router;
