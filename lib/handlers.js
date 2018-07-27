//
// Handlers file
//

// Dependencies
var helpers = require('./helpers')
var fs = require('fs')

// Create handlers object
var handlers = {}
handlers.notFound = function(data,res){
  res.writeHead(404)
  res.end()
}

handlers.redir = function(data, res){
  var acceptableMethods = ['get']
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._redir[data.method](data,res)
  } else {
    res.writeHead(405)
    res.end()
  }
}

handlers.static = function(data, res){
  var acceptableMethods = ['get']
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._static[data.method](data,res)
  } else {
    res.writeHead(405)
    res.end()
  }
}

// Create containers for the available methods
handlers._redir = {}
handlers._static = {}

handlers._static.get = function(data, res){
  var filePath = data.path
  var fileContent = fs.readFileSync(`.${filePath}`)
  res.writeHead(200, {
    'Content-type': 'text/html'
  })
  res.write(fileContent)
  res.end()
}

handlers._redir.get = function(data, res){
  var tokenData = data.queryStringObject.t ? data.queryStringObject.t : false;
  var idNoticia = data.queryStringObject.idNoticia ? data.queryStringObject.idNoticia : false;
  var idProdutoMvc = data.queryStringObject.idProdutoMvc ? data.queryStringObject.idProdutoMvc : false;
  if(tokenData) {
    // Decrypt token
    helpers.decrypt(tokenData).then(function (respDescripto){
    
    // Determine Id Noticia and IdProdutoMVC values
    // RegExp for xpto=abcd
    var queryObjRegExp = new RegExp('([^=&?]+)=([^&]+)', 'g')
    var params = respDescripto.match(queryObjRegExp)
    
    // Check if idBook came as a parameter to atribute the correct values on variables
    idProdutoMvc = params.length === 3 ? params[2] : params[1]
    idNoticia = params.length === 3 ? params[1] : params[0]
    console.log(idNoticia, idProdutoMvc)
    // Obtain shortlink
  helpers.shortLink(idNoticia, idProdutoMvc).then(function (respLink){
    console.log(respLink)
    var urlEnc = respLink.Url;
    var Titulo = respLink.Titulo;
    var fonte
    var fileName = urlEnc.substring((urlEnc.indexOf('.br') + 4),urlEnc.length);
    
    // Obtain info for crafting the preview
    helpers.getNoticia(idNoticia, idProdutoMvc).then(function (resNoticia){
    
      // Create html content
      var htmlContent = 
      `<html>
        <head>
          <meta property="og:title" content="${resNoticia.Titulo.trim()}">
          <meta property="og:description" content="${resNoticia.NomeFonte.trim()} | ${resNoticia.NomeProgramaSecao.trim()} | Veiculação: ${helpers.formatDate(resNoticia.DataHora.trim())}">
          <meta property="og:url" content="http://visualizacao.boxnet.com.br/">
        </head>
        <body>
        <script>
          window.location.assign('${respLink.Url}')
        </script>
        </body>
      </html>`
      fs.writeFile(`./static/${fileName}.html`, htmlContent, function(err){
        if(!err){
          res.write(`http://ec2-54-89-249-90.compute-1.amazonaws.com:5000/static/${fileName}.html`)
          res.end()
        } else {
          res.write('Error at creating html for preview', err)
        }
      })
    } ,function(err){
      console.log('Error at getting the news',err)
    })
  },function(err){
    console.log('Error at Google short link API',err)
  })
    }, function(err){
      console.log('Error on decrypt of token', err)
    })
  } else {
// Obtain shortlink
helpers.shortLink(idNoticia, idProdutoMvc).then(function (respLink){
  console.log(respLink)
  var urlEnc = respLink.Url;
  var Titulo = respLink.Titulo;
  var fonte
  var fileName = urlEnc.substring((urlEnc.indexOf('.br') + 4),urlEnc.length);
  
  // Obtain info for crafting the preview
  helpers.getNoticia(idNoticia, idProdutoMvc).then(function (resNoticia){
  
    // Create html content
    var htmlContent = 
    `<html>
      <head>
        <meta property="og:title" content="${resNoticia.Titulo.trim()}">
        <meta property="og:description" content="${resNoticia.NomeFonte.trim()} | ${resNoticia.NomeProgramaSecao.trim()} | Veiculação: ${helpers.formatDate(resNoticia.DataHora.trim())}">
        <meta property="og:url" content="http://visualizacao.boxnet.com.br/">
      </head>
      <body>
      <script>
        window.location.assign('${respLink.Url}')
      </script>
      </body>
    </html>`
    fs.writeFile(`./static/${fileName}.html`, htmlContent, function(err){
      if(!err){
        res.write(`http://ec2-54-89-249-90.compute-1.amazonaws.com:5000/static/${fileName}.html`)
        res.end()
      } else {
        res.write('Error at creating html for preview', err)
      }
    })
  } ,function(err){
    console.log('Error at getting the news',err)
  })
},function(err){
  console.log('Error at Google short link API',err)
})
  };
  
}

module.exports = handlers
