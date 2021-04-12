const request = require('request')
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

async function getAllListings () {
  let listings = []
  // Toronto
  let body = formatViewItData()
  let torontoListings = await getViewItListings(body)
  for (let i = 0; i < torontoListings.length; i++) {
    if (torontoListings[i].d) {
      listings = [...listings, ...formatData(torontoListings[i].d, 'Toronto')]
    } else {
      console.log('Unable  to get the data')
    }
  }
  // Vancouver
  body = formatVancouverData()
  let vancouverListings = await getViewItListings(body)
  for (let i = 0; i < vancouverListings.length; i++) {
    if (vancouverListings[i].d) {
      listings = [
        ...listings,
        ...formatData(vancouverListings[i].d, 'Vancouver')
      ]
    } else {
      console.log('Unable  to get the data')
    }
  }
  //Ottawa
  body = formatOttawaData()
  let ottawaListings = await getViewItListings(body)
  for (let i = 0; i < ottawaListings.length; i++) {
    if (ottawaListings[i].d) {
      listings = [...listings, ...formatData(ottawaListings[i].d, 'Ottawa')]
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
