const puppeteer = require('puppeteer')

;(async function main () {
  try {
    const options = {
      headless: false,
      ignoreHTTPSErrors: true,
      slowMo: 0,
      args: [
        '--window-size=1400,900',
        '--remote-debugging-port=9222',
        '--remote-debugging-address=0.0.0.0',
        '--disable-gpu',
        '--disable-features=IsolateOrigins,site-per-process',
        '--blink-settings=imagesEnabled=true'
      ]
    }
    const browser = await puppeteer.launch(options)
    const [page] = await browser.pages()

    await page.goto(
      'https://rentals.ca/phoenix/api/v1.0.2/listings?p=4&details=mid2&obj_path=toronto',
      { waitUntil: 'networkidle0' }
    )

    const data = await page.evaluate(() =>
      Array.from(document.querySelectorAll('*')).map(elem => elem.tagName)
    )

    console.log(data)

    await browser.close()
  } catch (err) {
    console.error(err)
  }
})()
