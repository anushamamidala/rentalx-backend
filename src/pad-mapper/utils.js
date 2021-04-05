const constructItem = (item = {}) => {
  let id = item.listing_id || ''
  let address = item.address || ''
  let postalCode = item.zipcode || ''
  let city = item.city || ''
  let minPrice = item.min_price || 0
  let maxPrice = item.max_price || 0
  let avgPrice = (minPrice + maxPrice) / 2
  let propertyType =
    item.property_type === 4
      ? 'Apartment'
      : item.property_type === 2
      ? 'House'
      : item.property_type === 16
      ? 'Room'
      : 'Other'
  let bedsRange = []
  if (item.min_bedrooms) {
    bedsRange.push(item.min_bedrooms)
  }
  if (item.max_bedrooms) {
    bedsRange.push(item.max_bedrooms)
  }
  let bathsRange = []
  if (item.min_bathrooms) {
    bathsRange.push(item.min_bathrooms)
  }
  if (item.max_bathrooms) {
    bathsRange.push(item.max_bathrooms)
  }
  const dateUpdated = item.modified_on || item.created_on || item.listed_on

  return {
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

const formatPadMapperData = (list = []) => {
  let data = []
  for (let item of list) {
    data.push(constructItem(item))
  }
  return data
}

module.exports = { formatPadMapperData }
