process.env.TZ = "Asia/Jakarta"
const http = require('http')
const httpProxy = require("http-proxy")
const express = require('express')
const port = process.env.PORT || 80 || 8080 || 3000
const lsToken = ['free']
const puppeteer = require('puppeteer')
function parseQuery(queryString) {
	if (!queryString) return {}
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}

// hahah gabut
function createServer(target) {
  var app = express()
  var proxy = httpProxy.createProxyServer({ target, ws: true })
  var server = http.createServer(app)
  
  app.get('/', function(req, res) {
    res.send('Silahkan konek bang')
  })
  server.on('upgrade', function (req, socket, head) {
    req.query = parseQuery(req.url.split('?')[1])
    if (!lsToken.includes(req.query.token)) return
    proxy.ws(req, socket, head)
  })
  server.listen(port)
  return `ws://0.0.0.0:${port}` 
}

// start browser
async function start() {
  const browser = await puppeteer.launch({
    executablePath: '/nix/store/x205pbkd5xh5g4iv0g58xjla55has3cx-chromium-108.0.5359.94/bin/chromium',
    /*
    executablePath: '', //untuk menyambungkan langsung ke chrome. Contoh: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    userDataDir: '', //untuk menyambungkan langsung ke chrome atau custom data. Contoh: "C:/\Users/\USERNAME/\AppData/\Local/\Google/\Chrome/\User Data",
    defaultViewport: { width: 1280, height: 720 },
    */
    headless: true, //ubah ini ke false jika ingin memantau chrome
    args: [
      '--disable-gpu',
      '--no-sandbox'
    ]
    
  })
  const pagesCount = (await browser.pages()).length
  const browserWSEndpoint = await browser.wsEndpoint()
  const customWSEndpoint = await createServer(browserWSEndpoint)
  console.log({ browserWSEndpoint, customWSEndpoint, pagesCount })
}
start()