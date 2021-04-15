const request = require('request')
const CONSTANTS = require('../constants/index')
const {
  formatViewItData,
  formatVancouverData,
  formatOttawaData
} = require('./viewit_data')
const { formatData } = require('./utils')

require('dotenv/config')

const getHeaders = () => ({
  'Content-Type': 'application/json'
})

// Method : POST
// Endpoint : VIEW_IT_API_URL

const getViewItListings = async body => {
  let response = []
  for (let i = 0; i < body.length; i++) {
    const OPTIONS = {
      method: 'POST',
      url: process.env.VIEW_IT_API_URL,
      headers: getHeaders(),
      body: JSON.stringify(body[i])
    }
    let resp = await getViewItData(OPTIONS)
    response.push(resp)
  }
  return response
}

// Call the getViewItData() to build response object for 
// the input options.

const getViewItData = async reqOptions => {
  try {
    return new Promise((resolve, reject) => {
      request(reqOptions, async function (err, res) {
        if (err) {
          reject(null)
        }
        let responseJSON = JSON.parse(res.body)
        resolve(responseJSON)
      })
    })
  } catch (error) {
    return null
  }
}

  // Gets all the listings for the cities : Toronto,Vancouver and Ottawa
async function getAllListings () {
  let listings = []

  // Call the method getViewItListings() to build listings in Toronto.
  let body = formatViewItData()
  let torontoListings = await getViewItListings(body)
  for (let i = 0; i < torontoListings.length; i++) {
    if (torontoListings[i].d) {
      listings = [...listings, ...formatData(torontoListings[i].d, CONSTANTS.TORONTO)]
    } else {
      console.log('Unable  to get the data')
    }
  }

  // Call the method getViewItListings() to build listings in Vancouver.
  body = formatVancouverData()
  let vancouverListings = await getViewItListings(body)
  for (let i = 0; i < vancouverListings.length; i++) {
    if (vancouverListings[i].d) {
      listings = [
        ...listings,
        ...formatData(vancouverListings[i].d, CONSTANTS.VANCOUVER)
      ]
    } else {
      console.log('Unable  to get the data')
    }
  }

   // Call the method getViewItListings() to build listings in Ottawa.
  body = formatOttawaData()
  let ottawaListings = await getViewItListings(body)
  for (let i = 0; i < ottawaListings.length; i++) {
    if (ottawaListings[i].d) {
      listings = [...listings, ...formatData(ottawaListings[i].d, CONSTANTS.OTTAWA)]
    } else {
      console.log('Unable  to get the data')
    }
  }
  try {
    collection.insertMany(listings)
  } catch (e) {
    console.log(e)
  }
}

const fetchViewItData = (databaseCollection = null) => {
  if (databaseCollection) {
    collection = databaseCollection
    getAllListings()
  }
}

module.exports = { fetchViewItData }
