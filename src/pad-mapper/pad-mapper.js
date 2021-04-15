const request = require("request");
const { formatPadMapperData } = require("./utils");
const axios = require("axios");
require("dotenv/config");

// Build token options with url as padmapper and method:GET
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

// city | Type: String | Values: ["Toronto", "Ottawa", "Vancouver"]
// propertyCategories | Type: String | Values: ["apartment", "condo", "house", "room"]

const getBody = (city, limit, offsetCount) => ({
  external: true,
  longTerm: true,
  minPrice: 0,
  shortTerm: true,
  transits: {},
  url: city,
  featuredLimit: 3,
  matching: true,
  limit: limit || 1,
  offset: offsetCount || 0,
  propertyCategories: ["apartment", "condo", "house", "room"],
});

// Method : POST
// Endpoint : PAD_MAPPER_API_DATA_URL

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

// Build all the listings for the locations from pad-mapper calling method getPadMapperDataPerCity()
// cityKeys: Optional | Type: String | Values: ["toronto-on", "vancouver-bc", "ottawa-on"]

async function getAllListings() {
  const cityKeys = ["toronto-on", "vancouver-bc", "ottawa-on"];
  tokenObj = await getToken();
  if (tokenObj) {
    for (const city of cityKeys) {
      let data = await getPadMapperDataPerCity(city);
    }
    return [];
  } else {
    console.log("Unable  to get the token");
  }
}

// Gets all the listings for a particular city

async function getPadMapperDataPerCity(city) {
  return new Promise(async (resolve, reject) => {
    request(getOptions(city), async (error, response) => {
      if (error) {
        console.log("Error fetching the data for city: ", city);
      }
      const totalRecords = JSON.parse(response.body).matching;
      const listingChunk = Math.ceil(totalRecords / 50);
      let refinedListings = [];
      const limit = 50;
      for (i = 0; i < listingChunk; i++) {
        const newLimit =
          totalRecords / (limit * (i + 1)) >= 1
            ? limit
            : totalRecords - limit * i;
        const res = await doRequest(newLimit, limit * i, city);
        if (res && Array.isArray(res)) {
          for (let listing of res) {
            refinedListings.push(listing);
          }
        }
      }
      try {
        let formattedData = formatPadMapperData(refinedListings);
        collection.insertMany(formattedData);
        resolve("");
      } catch (e) {
        reject(e);
      }
    });
  });
}

async function doRequest(limitCount, offSetCount, city) {
  try {
    const options = getOptions(city, limitCount, offSetCount);
    const res = await axios.post(options.url, JSON.parse(options.body), {
      headers: options.headers,
    });
    return res.data.listables;
  } catch (error) {
    return [];
  }
}

const fetchPadMapperData = (databaseCollection = null) => {
  if (databaseCollection) {
    collection = databaseCollection;
    let data = getAllListings();
    return data;
  }
};

module.exports = { fetchPadMapperData };
