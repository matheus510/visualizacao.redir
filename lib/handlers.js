//
// Handlers file
//

// Dependencies
var helpers = require('./helpers');
var fs = require('fs');

// Create handlers object
var handlers = {};
handlers.notFound = function(data,res){
  res.writeHead(404);
  res.end();
};

handlers.redir = function(data, res){
  var acceptableMethods = ['get'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._redir[data.method](data,res);
  }else{
    res.writeHead(405);
    res.end();
  }
};

handlers.static = function(data, res){
  var acceptableMethods = ['get'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._static[data.method](data,res);
  }else{
    res.writeHead(405);
    res.end();
  }
};

// Create containers for the available methods
handlers._redir = {};
handlers._static = {};

handlers._static.get = function(data, res){
  var filePath = data.path;
  fs.readFile(`.${filePath}`, function(err, data){
    if(!err){
      res.writeHead(200, {
        'Content-type': 'text/html'
      });
      res.write(data);
      res.end();
    }else{
      res.write('File not available');
      res.end();
    }
  })
}

handlers._redir.get = function(data, res){
  var tokenString = data.queryStringObject.t ? data.queryStringObject.t : false;
  var idNoticia = data.queryStringObject.idNoticia ? data.queryStringObject.idNoticia : false;
  var idProdutoMvc = data.queryStringObject.idProdutoMvc ? data.queryStringObject.idProdutoMvc : false;
  if(tokenString){
    // Decrypt token
    helpers.decrypt(tokenString).then(function (respDescripto){
    
      // Determine Id Noticia and IdProdutoMVC values
      // RegExp for xpto=abcd
      var queryObjRegExp = new RegExp('([^=&?]+)=([^&]+)', 'g');
      var params = respDescripto.match(queryObjRegExp);
      
      // Check if idBook came as a parameter to atribute the correct values on variables
      idProdutoMvc = params.length === 3 ? params[2] : params[1];
      idNoticia = params.length === 3 ? params[1] : params[0];
      
      // Create random name for file
      var fileName = helpers.createRandomString(20);

      // Prepare object to be sent
      var resObj ={
        "Url": `http://link.boxnet.com.br/static/${fileName}.html`
      };

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
              window.location.assign('http://visualizacao.boxnet.com.br/index.html#/?t=${tokenString}')
            </script>
          </body>
        </html>`;
        fs.writeFile(`./static/${fileName}.html`, htmlContent, function(err){
          if(!err){
            console.log(resObj);
            resObj = JSON.stringify(resObj);
            res.write(resObj);
            res.end();
          }else{
            res.write('Error at creating html for preview', err);
          }
        })
      } ,function(err){
        console.log('Error at getting the news',err);
      })
    }, function(err){
      console.log('Error on decrypt of token', err);
    })
  }else{
    res.write(404, 'Error: query string t parameter is worng or does not exit');
  }
}

module.exports = handlers;
