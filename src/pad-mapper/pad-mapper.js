const request = require("request");
const { formatPadMapperData } = require("./utils");
require("dotenv/config");

const TOKEN_OPTIONS = {
  method: "GET",
  url: process.env.PAD_MAPPER_API_TOKEN_URL,
};

let collection;
let tokenObj = {};

const getHeaders = () => ({
  "X-CSRFToken": tokenObj.csrf,
  "Content-Type": "application/json",
  "X-Zumper-XZ-Token": tokenObj.xz_token,
});

const getBody = (city, limit, offsetCount) => ({
  external: true,
  longTerm: false,
  minPrice: 0,
  shortTerm: false,
  transits: {},
  url: city,
  featuredLimit: 3,
  matching: true,
  limit: limit || 1,
  offsetCount: offsetCount || 0,
});

const getOptions = (city, limitCount, offsetCount) => ({
  method: "POST",
  url: process.env.PAD_MAPPER_API_DATA_URL,
  headers: getHeaders(),
  body: JSON.stringify(getBody(city, limitCount, offsetCount)),
});

const getToken = async () => {
  try {
    return new Promise((resolve, reject) => {
      request(TOKEN_OPTIONS, async function (err, res) {
        if (err) {
          reject(null);
        }
        let responseJSON = JSON.parse(res.body);
        resolve(responseJSON);
      });
    });
  } catch (error) {
    return null;
  }
};

async function getAllListings() {
  const cityKeys = ["toronto-on", "vancouver-bc", "ottawa-on"];
  tokenObj = await getToken();
  if (tokenObj) {
    for (const city of cityKeys) {
      await getPadMapperDataPerCity(city);
    }
  } else {
    console.log("Unable  to get the token");
  }
}

async function getPadMapperDataPerCity(city) {
  return new Promise(async (resolve, reject) => {
    request(getOptions(city), async (error, response) => {
      if (error) {
        console.log("Error fetching the data for city: ", city);
      }
      const listingChunk = Math.ceil(JSON.parse(response.body).matching / 50);
      let refinedListings = [];
      const limit = 50;
      for (i = 0; i < listingChunk; i++) {
        await doRequest(limit, limit * i, city)
          .then((res) => {
            if (res && Array.isArray(res)) {
              for (let listing of res) {
                refinedListings.push(listing);
              }
            }
          })
          .catch((error) =>
            console.log("Error while getting the listings at limit: " + limit)
          );
      }
      try {
        let formattedData = formatPadMapperData(refinedListings);
        collection.insertMany(formattedData);
        resolve("done");
      } catch (e) {
        reject(e);
      }
    });
  });
}

function doRequest(limitCount, offSetCount, city) {
  return new Promise((resolve, reject) => {
    request(
      getOptions(city, limitCount, offSetCount),
      function (error, res, body) {
        try {
          resolve(JSON.parse(body).listables);
        } catch (parseError) {
          reject(parseError);
        }
      }
    );
  });
}

const fetchPadMapperData = (databaseCollection = null) => {
  if (databaseCollection) {
    collection = databaseCollection;
    getAllListings();
  }
};

module.exports = { fetchPadMapperData };
