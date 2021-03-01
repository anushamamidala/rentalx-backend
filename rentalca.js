const Express = require("express");
var request = require("request");
const BodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const { min } = require("moment");

var app = Express();
app.use(BodyParser.json());
app.use(
  BodyParser.urlencoded({
    extended: true,
  })
);
var database, collection;

const CONNECTION_URL =
  "mongodb+srv://admin:admin@rentalcluster.thm22.mongodb.net/test?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true";

app.listen(5000, () => {
  MongoClient.connect(CONNECTION_URL, (error, client) => {
    if (error) {
      throw error;
    }
    database = client.db("test");
    collection = database.collection("rentals");
    console.log("Connected to `" + "test" + "`!");
    getData();
  });
});

async function fallAsleep(sleepTime) {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve();
    }, sleepTime);
  });
}

async function getData() {
  var options = {
    method: "GET",
    url:
      "https://rentals.ca/phoenix/api/v1.0.2/listings?details=mid1&suppress-pagination=1&limit=500&obj_path=toronto",
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36",
      "x-csrftoken":
        "KDpIzAatsfoUOieY7TNFRJ5WC4CnL9BgEjlLsG7quLixHrYX00kHFgGfW72SvWQw",
    },
  };
  request(options, async function (error, response) {
    if (error) throw new Error(error);
    let totalProp = JSON.parse(response.body).meta.total_properties / 10;
    console.log(JSON.parse(response.body).meta.total_properties);
    let refinedListings = [];
    for (i = 2; i < totalProp; i++) {
      await getAllRentalCAListings(i)
        .then((res) => {
          if (res) {
            console.log(i, "****");
            const rentalListing = res;
            if (rentalListing && rentalListing.length > 0) {
              rentalListing.forEach((rental) => {
                const rentalAvg = (arr) =>
                  arr.reduce((a, b) => a + b, 0) / arr.length;
                let rentalObj = {
                  id: rental.id,
                  address: rental.address1,
                  addressDetail: rental.address2,
                  postalCode: rental.postal_code,
                  location: rental.location,
                  city: "Toronto", //get the city name with the help of Id
                  propertyType: rental.property_type,
                  rentRange: rental.rent_range,
                  minPrice: Math.min(rental.rent_range),
                  maxPrice: Math.max(rental.rent_range),
                  avgPrice: rentalAvg(rental.rent_range),
                  bedsRange: rental.beds_range,
                  bathsRange: rental.baths_range,
                  dateUpdated: rental.updated,
                };
                refinedListings.push(rentalObj);
              });
            }
          }
        })
        .catch((error) => console.log("------------------------------"));
      if (i % 30 === 0) {
        await fallAsleep(1000 * 60 * 5);
      }
    }
    try {
      collection.insertMany(refinedListings);
    } catch (e) {
      console.log(e);
    }
  });
}

async function getAllRentalCAListings(i) {
  let res = await doRequest(i);
  //   if (res.inculdes("Incapsula incident ID")) {
  //     return null;
  //   }
  return new Promise(function (resolve, reject) {
    if (res) {
      resolve(res);
    } else {
      reject(res);
    }
  });
}

function doRequest(pgNo) {
  return new Promise(function (resolve, reject) {
    let url =
      "https://rentals.ca/phoenix/api/v1.0.2/listings?p=" +
      pgNo +
      "&details=mid2&obj_path=toronto";
    var options = {
      method: "GET",
      url: url,
      headers: {
        "x-csrftoken":
          "KDpIzAatsfoUOieY7TNFRJ5WC4CnL9BgEjlLsG7quLixHrYX00kHFgGfW72SvWQw",
        "user-agent":
          " Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36",
      },
    };
    request(options, function (error, res, body) {
      try {
        const parsedBody = JSON.parse(JSON.stringify(body));
        //console.log(parsedBody);
        resolve(JSON.parse(body).data.listings);
      } catch (parseError) {
        console.log(parseError);
        reject(parseError);
      }

      //console.log(body);
      // if (
      //   !error &&
      //   res.statusCode == 200
      //   //!body.includes("Request unsuccessful")
      // ) {
      //   console.log(body);
      //   resolve(JSON.parse(body).data.listings);
      // } else {
      //   reject(error);
      // }
    });
  });
}
