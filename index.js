//
// Initial file for PreviewMaker
//

// Main dependencies
var http = require('http');
var url = require('url');
var handlers = require('./lib/handlers');
var workers = require('./lib/workers');
var string_decoder_module = require('string_decoder');

// Set constructor as variable
var StringDecoder = string_decoder_module.StringDecoder;

// Define the request router
var router = {
  'redir': handlers.redir,
  'visualizacao': handlers.visualizacao,
  'static': handlers.static,
  'notFound': handlers.notFound
};

////////////////////////////////////////////
// BREAK THE GLASS IN CASE OF HTTPS     //
//       Use em caso de urgencia        //
/////////////////////////////////////////
/* var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
} */

// Modularized server in case of https need
var internalServer = function (req, res){

  // Parse received url
  var parsedUrl = url.parse(req.url, true);

  // Obtain path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  var queryStringObj = parsedUrl.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();

  // Get the headers as an object
  var headers = req.headers;

  // Get the payload,if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';

  req.on('data',(data) => {
    buffer += decoder.write(data);
  })

  req.on('end',() => {
    buffer += decoder.end();
    // Construct the data object to send to the handler
    var data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObj,
      'method': method,
      'headers': headers,
      'payload': buffer,
      'path': path
    };
    // Determine handler to be used
    var chosenHandler = trimmedPath.indexOf('static') > -1 ?
      router['static'] : typeof (router[trimmedPath]) !== 'undefined' ?
      router[trimmedPath] : handlers.notFound;
    // Invoke chosen handler  
    chosenHandler(data, res);
  });
};

var httpServer = http.createServer((req,res) => {
  internalServer(req, res);
});

// Start the HTTPS server
httpServer.listen('80',() => {
  console.log('\x1b[35m%s\x1b[0m','listening at port: 80');
  workers.init();
});
