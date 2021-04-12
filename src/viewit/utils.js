const constructItem = (item = {}) => {
  let site = 'viewIt'
  let id = item.iVit || ''
  let address = item.Address || ''
  let postalCode = item
  let city = item.cityName
  let minPrice = 0
  let maxPrice = item.Price / 1
  let avgPrice = item.Price / 2
  let bedsRange = [item.Bedroom === 0 ? 1 : item.Bedroom]
  let bathsRange = ''
  let dateUpdated = Math.round(new Date().getTime() / 1000)
  let propertyType = 'Apartment'

  return {
    site,
    id,
    address,
    postalCode,
    city,
    minPrice,
    maxPrice,
    avgPrice,
    bedsRange,
    bathsRange,
    dateUpdated,
    propertyType
  }
}

const formatData = (list = [], city) => {
  let data = []
  for (let item of list) {
    item.cityName = city
    data.push(constructItem(item))
  }
  return data
}

module.exports = { formatData }
