const Express = require('express')
const request = require('request')
const BodyParser = require('body-parser')
const { MongoClient } = require('mongodb')
const app = Express()
require('dotenv/config')

app.use(BodyParser.json())
app.use(
  BodyParser.urlencoded({
    extended: true
  })
)
var database, collection
const CONNECTION_URL =
  'mongodb+srv://admin:admin@rentalcluster.thm22.mongodb.net/test?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true'

app.listen(5000, () => {
  MongoClient.connect(CONNECTION_URL, (error, client) => {
    if (error) {
      throw error
    }
    database = client.db('test')
    collection = database.collection('listings')
    console.log('Connected to `' + 'test' + '`!')
    getData()
  })
})

async function getData () {
  var options = {
    method: 'GET',
    url:
      'https://rentals.ca/phoenix/api/v1.0.2/listings?details=mid1&suppress-pagination=1&limit=500&obj_path=toronto',
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36',
      'x-csrftoken':
        'KDpIzAatsfoUOieY7TNFRJ5WC4CnL9BgEjlLsG7quLixHrYX00kHFgGfW72SvWQw'
    }
  }
  request(options, async function (error, response) {
    if (error) throw new Error(error)
    let totalProp = JSON.parse(response.body).meta.total_properties / 10
    console.log(JSON.parse(response.body).meta.total_properties)
    let refinedListings = []
    for (i = 2; i < totalProp; i++) {
      await getAllRentalCAListings(i)
        .then(res => {
          if (res) {
            console.log(i, '****')
            const rentalListing = res
            if (rentalListing && rentalListing.length > 0) {
              rentalListing.forEach(rental => {
                const rentalAvg = arr =>
                  arr.reduce((a, b) => a + b, 0) / arr.length
                let rentalObj = {
                  site: 'rentals.ca',
                  id: rental.id,
                  address: rental.address1,
                  addressDetail: rental.address2,
                  postalCode: rental.postal_code,
                  location: rental.location,
                  city: 'Toronto', //get the city name with the help of Id
                  propertyType: rental.property_type,
                  rentRange: rental.rent_range,
                  minPrice: Math.min.apply(Math, rental.rent_range),
                  maxPrice: Math.max.apply(Math, rental.rent_range),
                  avgPrice: rentalAvg(rental.rent_range),
                  bedsRange: rental.beds_range,
                  bathsRange: rental.baths_range,
                  dateUpdated: rental.updated
                }
                refinedListings.push(rentalObj)
              })
            }
          }
        })
        .catch(error => console.log('Error', error))
    }
    try {
      collection.insertMany(refinedListings)
    } catch (e) {
      console.log(e)
    }
  })
}

async function getAllRentalCAListings (i) {
  let res = await doRequest(i)
  return new Promise(function (resolve, reject) {
    if (res) {
      resolve(res)
    } else {
      reject(res)
    }
  })
}

function doRequest (pgNo) {
  return new Promise(function (resolve, reject) {
    let url =
      'https://rentals.ca/phoenix/api/v1.0.2/listings?p=' +
      pgNo +
      '&details=mid2&obj_path=toronto'
    var options = {
      method: 'GET',
      url: url,
      headers: {
        'x-csrftoken':
          'KDpIzAatsfoUOieY7TNFRJ5WC4CnL9BgEjlLsG7quLixHrYX00kHFgGfW72SvWQw',
        referer: 'https://rentals.ca/toronto?p=' + pgNo,
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
        cookie:
          'visid_incap_2331841=tPrtmjtTSB25dLHYApQzWDv4F2AAAAAAQUIPAAAAAAAQkh5/zIQmw3g4hX2FsdeI; csrftoken=KDpIzAatsfoUOieY7TNFRJ5WC4CnL9BgEjlLsG7quLixHrYX00kHFgGfW72SvWQw; _gcl_au=1.1.158846154.1612183614; _ga=GA1.2.204922717.1612183614; _hjid=2a5181f8-b836-4217-b20d-5326dd244d5f; __ssid=8885412a95d3bf834c4eaed93d9fe87; ll-commute-mode=car; __atssc=google%3B1; sessionid=jo7us2531vyeuyh1kaxcs1m84bvrbje1; nlbi_2331841=AmOSA6jk3DeJ4dDCWVxiFQAAAACUELBf6oCj3sFHRsjS2LSW; incap_ses_1166_2331841=NE51JAsgcV3dOs0bFncuEFHFYmAAAAAAY2+Qm7z5U5Sf6mrSUCL6+Q==; _gid=GA1.2.1064795813.1617085781; _hjAbsoluteSessionInProgress=1; __cfduid=dc97324a780989cb4864208cd031e21b71617085787; _tac=false~self|not-available; _ta=ca~1~ce68b0088a6cb5cf603bbf65281339b3; __atuvc=1%7C9%2C0%7C10%2C0%7C11%2C0%7C12%2C2%7C13; incap_ses_1229_2331841=M+POUKhX1V8h1y8FSkkOEUnIYmAAAAAAgtCuDEFKt6PersDS0WCKEQ==; nlbi_2331841_2147483646=VjAbKXe3u0rgSp1JWVxiFQAAAABDJ7qnIKvbXpE0G8OsDx42; reese84=3:QZAmuPY6qqEMum6bvZGtbg==:2Btj/h6+hYzDT7J2U4dRn5CRkHEXhKpfkHLrwHt19f8oY3l7B78A8lRza4vgfmuESrFhUhVUaArBNO/fHXUtMZWToLj356cLdsUJFgtxu+v4eOklrC/DKpDH9pKy6pRZDgP+hqWV6uA/3kg3AG2W0/518I7gjUhrKQgYfvMrZioh94bwkWE9OWp/bthVH41O0ST4QHLxEqpaDxSqkjILhjt1MLCSuvQdfVBeID8B1ODtJlyB4P6gflWIs7Mp15f8NhKyR6Zs/Ugk0xqMdA9zUVuk9SAuJovXb1NF1uaPpOXXo0dkKhHlYn7uqzJMOXJVsduz1V9q6XpYzlr+eVYLkvkJMetv5K2hDkurE6eEN8KBa0WeeKRE8Q6duT4NwWn2mBfGjM8XjfX5d/bcvophPak1AGhMS2HNkB1JdkdU4qB1ee34yArzprYj53RSsBJitQ+LK6C+Z6rCce67ezRnKA==:Iudhn4GMpqXjVUoyCxhMPXa382E1kY+JHWr5AFoqKnE='
      }
    }
    request(options, function (error, res, body) {
      try {
        const parsedBody = JSON.parse(JSON.stringify(body))
        resolve(JSON.parse(body).data.listings)
      } catch (parseError) {
        console.log(parseError)
        reject(parseError)
      }
    })
  })
}
