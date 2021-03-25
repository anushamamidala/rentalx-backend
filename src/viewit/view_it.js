const request = require('request')
require('dotenv/config')

const getHeaders = () => ({
  'Content-Type': 'application/json'
})

const getBody = () => ({
  NELat: 44.071800467511565,
  NELong: -79.11941528320314,
  SWLat: 43.45690646829031,
  SWLong: -79.86099243164064,
  MapCenterLat: 43.765143524274066,
  MapCenterLng: -79.49020385742189,
  MapZoom: 10,
  minPrice: 1,
  maxPrice: 4000,
  room: true,
  bachelor: false,
  room1: false,
  room2: false,
  room3: false,
  furnished: true,
  unfurnished: true,
  loft: false,
  basement: true,
  retirement: false,
  ShortTerm: false,
  AC: false,
  FridgeStove: false,
  Parking: false,
  Balcony: false,
  Pets: false,
  Cats: false,
  Fireplace: false,
  Laundary: false,
  Yard: false,
  Dishwasher: false,
  Exerciseroom: false,
  Pool: false,
  Deck: false,
  sFilterText: '',
  iCityID: 51,
  MapSettings: '43.765143524274066,-79.49020385742189,10,1'
})

const OPTIONS = {
  method: 'POST',
  url: process.env.VIEW_IT_API_URL,
  headers: getHeaders(),
  body: JSON.stringify(getBody())
}

const getViewItData = async () => {
  try {
    return new Promise((resolve, reject) => {
      request(OPTIONS, async function (err, res) {
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
  let allListings = await getViewItData()
  if (allListings.d) {
    for (const listing of allListings.d) {
      console.log(listing)
    }
  } else {
    console.log('Unable  to get the data')
  }
}

const fetchViewItData = (databaseCollection = null) => {
  if (databaseCollection) {
    collection = databaseCollection
    getAllListings()
  }
}

module.exports = { fetchViewItData }
