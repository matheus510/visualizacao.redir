//
// Initial file for PreviewMaker
//

// Main dependencies
const http = require('http')
const url = require('url')
const handlers = require('./lib/handlers')
const workers = require('./lib/workers')
const string_decoder_module = require('string_decoder')

// Set constructor as variable
const StringDecoder = string_decoder_module.StringDecoder

// Define the request router
const router = {
  'redir': handlers.redir,
  'visualizacao': handlers.visualizacao,
  'static': handlers.static,
  'notFound': handlers.notFound
}

////////////////////////////////////////////
// BREAK THE GLASS IN CASE OF HTTPS     //
//       Use em caso de urgencia        //
/////////////////////////////////////////
/* let httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
} */

// Modularized server in case of https need
const internalServer = function (req, res){

  // Parse received url
  let parsedUrl = url.parse(req.url, true)

  // Obtain path
  let path = parsedUrl.pathname
  let trimmedPath = path.replace(/^\/+|\/+$/g, '')

  // Get the query string as an object
  let queryStringObj = parsedUrl.query

  // Get the HTTP method
  let method = req.method.toLowerCase()

  // Get the headers as an object
  let headers = req.headers

  // Get the payload,if any
  let decoder = new StringDecoder('utf-8')
  let buffer = ''

  req.on('data',(data) => {
    buffer += decoder.write(data)
  })

  req.on('end',() => {
    buffer += decoder.end()
    // Construct the data object to send to the handler
    let data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObj,
      'method': method,
      'headers': headers,
      'payload': buffer,
      'path': path
    }
    // Determine handler to be used
    let chosenHandler = trimmedPath.indexOf('static') > -1 ?
      router['static'] : typeof (router[trimmedPath]) !== 'undefined' ?
      router[trimmedPath] : handlers.notFound
    // Invoke chosen handler  
    chosenHandler(data, res)
  })
}

const httpServer = http.createServer((req,res) => {
  internalServer(req, res)
})

// Start the HTTPS server
httpServer.listen('80',() => {
  console.log('\x1b[35m%s\x1b[0m','listening at port: 80')
  workers.init()
})
