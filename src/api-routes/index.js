const express = require("express");
const router = express.Router();
const db = require("../db");
const { fetchPadMapperData } = require("../pad-mapper/pad-mapper");
const { getChartData } = require("../utils/chart-helper");
require("dotenv/config");

const routes = (dbCollection) => {
  // Method : POST
  // Endpoint : BASE_URL/api/listings-count
  // body params
  // cityName: Optional | Type: String | Values: ["Toronto", "Ottawa", "Vancouver"]
  router.post("/listings-count", async (request, response) => {
    const cityName = request.body.cityName;
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
      let padMapperListings = await dbCollection.find(findObj).toArray();
      result.listings_count[period] = padMapperListings.length;
      const chartData = getChartData(padMapperListings, period);
      result.chart_data[period] = chartData;
    }
    response.send(result);
  });

  // Method : POST
  // Endpoint : BASE_URL/api/listings-price
  router.post("/listings-price", async (request, response) => {
    const result = await dbCollection
      .aggregate([
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
    fetchPadMapperData(dbCollection);
    res.send("Fetching data..");
  });
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
