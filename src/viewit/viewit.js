// Required data id: rental.listing_id, address: rental.building_name, addressDetail: rental.address, postalCode: rental.zipcode, location: rental.neighborhood_name, city: rental.city, propertyType: rental.property_type, rentRange: [rental.min_price, rental.max_price], bedsRange: [rental.min_bedrooms, rental.max_bedrooms], bathsRange: rental.min_all_bathrooms, dateUpdated: rental.created_on,

const axios = require('axios')
const cheerio = require('cheerio')

const links = []

const puppeteer = require('puppeteer')

const innerData = async function (link) {
  let browser = await puppeteer.launch()
  let page = await browser.newPage()
  console.log(link)
  if (link) {
    await page.goto('https://' + link)
    let textContent = await page.content()
    let $ = cheerio.load(textContent)
    $('.featuredListing').each(function (id, elem) {
      let roomLink = $(elem).attr('href')
      console.log(roomLink)
    })
  }
}

;(async () => {
  let browser = await puppeteer.launch()
  let page = await browser.newPage()

  await page.goto('https://www.viewit.ca')

  let textContent = await page.content()
  let $ = cheerio.load(textContent)
  await browser.close()
  $('.link').each(function (id, elem) {
    let city = $(elem).attr('href')

    if (city != null) {
      links.push(city.slice(2))
      innerData(city.slice(2))
      // axios(city.slice(2))
      //   .then((response) => {
      //     if (response) {
      //       console.log(response.data.body);
      //     }
      //   })
      //   .catch(function (error) {
      //     if (error.response) {
      //       console.log(error.response.status);
      //     }
      //   });
    }
  })
  /* No Problem Mate */

  browser.close()
  //   links.forEach(function(link, index){
  //       (async () => {
  //          browser = await puppeteer.launch();
  //          page = await browser.newPage();

  //         await page.goto("https:"+link);
  //       )();
  //   })
})()
