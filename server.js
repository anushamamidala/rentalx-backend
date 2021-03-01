const express = require("express");
const server = express();
var moment = require("moment");

const body_parser = require("body-parser");

server.use(body_parser.json());

const port = 4000;

const db = require("./db");
const dbName = "test";
const collectionName = "padmapperData";

db.initialize(
  dbName,
  collectionName,
  function (dbCollection) {
    // gets all the listings available
    // CityName must be Toronto, Vancouver, Ottawa
    server.get("/allListings/:cityName", (request, response) => {
      const cityName = request.params.cityName;
      dbCollection.find({ city: cityName }).toArray(function (err, result) {
        if (err) throw err;
        response.json(result);
      });
    });

    // Gets the listings within 24hrs with respect to the city
    // CityName must be Toronto, Vancouver, Ottawa
    server.get("/todaysListings/:cityName", (request, response) => {
      const cityName = request.params.cityName;
      dbCollection
        .find({
          city: cityName,
          dateUpdated: {
            $gt: Math.floor(
              new Date(Date.now() - 24 * 60 * 60 * 1000).getTime() / 1000
            ),
          },
        })
        .toArray(function (err, result) {
          if (err) throw err;
          const listings = result;
          let listingsInDay = [];
          listings.forEach((key) => {
            var date = new Date(key.dateUpdated * 1000);
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();
            var fulldate = hours + ":" + minutes.substr(-2);
            listingsInDay.push({ name: fulldate });
          });
          let res = {
            totalListings: result.length,
            listings: listingsInDay,
          };
          response.json(res);
        });
    });

    // Gets the listings within given days with respect to the city
    // CityName must be Toronto, Vancouver, Ottawa
    server.get("/todaysListings/:cityName/:days", (request, response) => {
      const cityName = request.params.cityName;
      const days = request.params.days;
      dbCollection
        .find({
          city: cityName,
          dateUpdated: {
            $gt: Math.floor(
              new Date(Date.now() - days * 24 * 60 * 60 * 1000).getTime() / 1000
            ),
          },
        })
        .toArray(function (err, result) {
          if (err) throw err;
          const listings = result;
          let listingsInDay = [];
          listings.forEach((key) => {
            var date = new Date(key.dateUpdated * 1000);
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();
            var fulldate = hours + ":" + minutes.substr(-2);
            listingsInDay.push({ name: fulldate });
          });
          let res = {
            totalListings: result.length,
            listings: listingsInDay,
          };
          response.json(res);
        });
    });

    // Gets an array of average, maximum and minimum of all the rentals
    // Toronto, Vancouver, Ottawa
    server.get("/priceListings", (request, response) => {
      const cityName = request.params.cityName;
      dbCollection
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
        .toArray(function (err, result) {
          if (err) throw err;
          response.json(result);
        });
    });
  },
  function (err) {
    throw err;
  }
);

server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
