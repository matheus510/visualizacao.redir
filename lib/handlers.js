// Handlers file

// dependencies
var helpers = require('./helpers');
var fs = require('fs');
// create handlers object
var handlers = {};
handlers.notFound = function(data,res){
  res.writeHead(404);
  res.end();
};

handlers.redir = function(data, res){
  var acceptableMethods = ['get'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._redir[data.method](data,res);
  } else {
    res.writeHead(405);
    res.end();
  }
};
handlers.static = function(data, res){
  var acceptableMethods = ['get'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._static[data.method](data,res);
  } else {
    res.writeHead(405);
    res.end();
  }
}
// criar os containers pra receber os metodos
handlers._redir = {};
handlers._static = {};

handlers._static.get = function(data, res) {
  var filePath = data.path;
  var fileContent = fs.readFileSync(`.${filePath}`);
  res.writeHead(200, {
    'Content-type': 'text/html'
  })
  res.write(fileContent)
  res.end();

}

handlers._redir.get = function(data, res){
  var tokenData = data.queryStringObject.t;

  // Descriptografar token
  helpers.decrypt(tokenData).then(function (respDescripto) {
    
    // Determinar valores de Id Noticia e ProdutoMVC
    // RegExp para identificar xpto=abcd
    var queryObjRegExp = new RegExp('([^=&?]+)=([^&]+)', 'g')
    var params = respDescripto.match(queryObjRegExp)
    
    // Determinar se idBook veio junto
    // Atribuir valores corretamente
    var idProdutoMvc = params.length === 3 ? params[2] : params[1]
    var idNoticia = params.length === 3 ? params[1] : params[0]
    
    //Obter link encurtado da api do google
    helpers.shortLink(idNoticia, idProdutoMvc).then(function (respLink) {
      var urlEnc = respLink.Url;
      var fileName = urlEnc.substring((urlEnc.indexOf('.br') + 4),urlEnc.length)
      // Obter a noticia para montar pequeno preview
      helpers.getNoticia(params.length, params).then(function (resNoticia) {
      // Atribuir as informações nas tags meta a serem adicionadas
      var htmlContent = `
      <html>
        <head>
          <meta property="og:title" content="${resNoticia.Titulo.trim()}">
          <meta property="og:description" content="${resNoticia.NomeFonte.trim()} | ${resNoticia.NomeProgramaSecao.trim()} | Veiculação: ${helpers.formatDate(resNoticia.DataHora.trim())}">
          <meta property="og:url" content="http://visualizacao.boxnet.com.br/">
        </head>
        <body>
        <script>
          window.location.assign('${respLink.Url}');
        </script>
        </body>
      </html>
      `;
        fs.writeFile(`./static/${fileName}.html`, htmlContent, function(err) { 
          res.write(`http://ec2-54-89-249-90.compute-1.amazonaws.com:5000/static/${fileName}.html`)
          res.end();
        })
    } ,function(err) {
      console.log('Error at getting the news',err)
    })
    },function(err) {
      console.log('Error at Google short link API',err)
    })
  }, function(err) {
    console.log('Error on decrypt of token', err)
  })
}

module.exports = handlers
