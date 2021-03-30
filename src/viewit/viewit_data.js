const formatViewItData = (list = []) => {
  let data = []
  // Toronto
  let item = {
    NELat: 44.071800467511565,
    NELong: -79.11941528320314,
    SWLat: 43.45690646829031,
    SWLong: -79.86099243164064,
    MapCenterLat: 43.765143524274066,
    MapCenterLng: -79.49020385742189,
    MapZoom: 10,
    minPrice: 1,
    maxPrice: 50000,
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
  }
  data.push(item)

  return data
}

module.exports = { formatViewItData }
