const Express = require("express");
var request = require("request");
const BodyParser = require("body-parser");
const { MongoClient } = require("mongodb");

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

app.listen(5001, () => {
  MongoClient.connect(CONNECTION_URL, (error, client) => {
    if (error) {
      throw error;
    }
    try {
      database = client.db("test");
      collection = database.collection("padmapperData");
      console.log("Connected to `" + "test" + "`!");
    } catch (error) {
      console.log(error);
    }
    getAllListings();
  });
});

async function getAllListings() {
  const keys = ["toronto-on", "vancouver-bc", "ottawa-on"];
  for (let i = 0; i < keys.length; i++) {
    var res = await getPadmapperData(keys[i]);
  }
}

async function getPadmapperData(city) {
  return new Promise(function (resolve, reject) {
    var op = {
      method: "GET",
      url: "https://www.padmapper.com/api/t/1/bundle",
    };
    request(op, async function (err, res) {
      if (err) throw new Error(err);
      var responseJSON = JSON.parse(res.body);
      var options = {
        method: "POST",
        url: "https://www.padmapper.com/api/t/1/pages/listables",
        headers: {
          "X-CSRFToken": responseJSON.csrf,
          "Content-Type": "application/json",
          "X-Zumper-XZ-Token": responseJSON.xz_token,
        },
        body: JSON.stringify({
          external: true,
          longTerm: false,
          minPrice: 0,
          shortTerm: false,
          transits: {},
          url: city,
          featuredLimit: 3,
          matching: true,
          limit: 1,
        }),
      };
      request(options, async function (error, response) {
        if (error) throw new Error(error);
        const numOfListings = JSON.parse(response.body).matching / 50;
        let refinedListings = [];
        const limit = 50;
        for (i = 0; i < numOfListings; i++) {
          await getAllPadmapperListings(limit, limit * i, responseJSON, city)
            .then((res) => {
              if (res) {
                const rentalListing = res;
                if (rentalListing && rentalListing.length > 0) {
                  rentalListing.forEach((rental) => {
                    //   console.log(rental.building_name, "****");

                    let rentalObj = {
                      id: rental.listing_id,
                      address: rental.building_name,
                      addressDetail: rental.address,
                      postalCode: rental.zipcode,
                      location: rental.neighborhood_name,
                      city: rental.city,
                      propertyType: rental.property_type,
                      rentRange: [rental.min_price, rental.max_price],
                      minPrice: rental.min_price,
                      maxPrice: rental.max_price,
                      avgPrice: (rental.min_price, rental.max_price) / 2,
                      bedsRange: [rental.min_bedrooms, rental.max_bedrooms],
                      bathsRange: rental.min_all_bathrooms,
                      dateUpdated: rental.created_on,
                    };
                    refinedListings.push(rentalObj);
                  });
                }
              }
            })
            .catch((error) => console.log("------------------------------"));
        }
        try {
          collection.insertMany(refinedListings);
          resolve("done");
        } catch (e) {
          console.log(e);
          reject(e);
        }
      });
    });
  });
}

async function getAllPadmapperListings(
  limitCount,
  offSetCount,
  responseJSON,
  city
) {
  let res = await doRequest(limitCount, offSetCount, responseJSON, city);
  return new Promise(function (resolve, reject) {
    if (res) {
      resolve(res);
    } else {
      reject(res);
    }
  });
}

function doRequest(limitCount, offSetCount, responseJSON, city) {
  let bodyItem = {
    external: true,
    longTerm: false,
    minPrice: 0,
    shortTerm: false,
    transits: {},
    url: city,
    featuredLimit: 3,
    matching: true,
    limit: limitCount,
    offset: offSetCount,
  };
  return new Promise(function (resolve, reject) {
    var options = {
      method: "POST",
      url: "https://www.padmapper.com/api/t/1/pages/listables",
      headers: {
        "X-CSRFToken": responseJSON.csrf,
        "Content-Type": "application/json",
        "X-Zumper-XZ-Token": responseJSON.xz_token,
      },
      body: JSON.stringify(bodyItem),
    };
    request(options, function (error, res, body) {
      try {
        const parsedBody = JSON.parse(JSON.stringify(body));
        resolve(JSON.parse(body).listables);
      } catch (parseError) {
        console.log(parseError, "---------------------------");
        reject(parseError);
      }
    });
  });
}
