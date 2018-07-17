// handlers file

// dependencies
var helpers = require('./helpers');
var fs = require('fs');
var path = require('path')
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
  var dataToken = data.queryStringObject.t;
  helpers.descriptografar(dataToken).then(function (resDe) {
    
    // Determinar valores de Id Noticia e ProdutoMVC
    // RegExp para identificar xpto=abcd
    const expressao = new RegExp('([^=&?]+)=([^&]+)', 'g')
    var arrayParametros = resDe.match(expressao)
    
    // Determinar se idBook veio junto
    var nParametros = arrayParametros.length
    
    // Atribuir valores corretamente
    var idProdutoMvc = nParametros === 3 ? arrayParametros[2] : arrayParametros[1]
    var idNoticia = nParametros === 3 ? arrayParametros[1] : arrayParametros[0]
    
    //Obter link encurtado da api do google
    helpers.linkEncurtado(idNoticia, idProdutoMvc).then(function (dataEncurtador) {
      var urlEnc = dataEncurtador.Url;
      var fileName = urlEnc.substring((urlEnc.indexOf('.br') + 4),urlEnc.length)
      // Obter a noticia para montar pequeno preview
      helpers.getNoticia(nParametros, arrayParametros).then(function (resNoticia) {
      // Atribuir as informações nas tags meta a serem adicionadas
      var conteudo = `
      <html>
        <head>
          <meta property="og:title" content="${resNoticia.Titulo.trim()}">
          <meta property="og:description" content="${resNoticia.NomeFonte.trim()} | ${resNoticia.NomeProgramaSecao.trim()} \n ${resNoticia.DataHora.trim()} | ${resNoticia.DataHoraCaptura.trim()}">
          <meta property="og:url" content="http://visualizacao.boxnet.com.br/">
        </head>
        <body>
        <script>
          window.location.assign('${dataEncurtador.Url}');
        </script>
        </body>
      </html>
      `;
        fs.writeFile(`./static/${fileName}.html`, conteudo, function(err) { 
          res.write(`http://ec2-54-89-249-90.compute-1.amazonaws.com:5000/static/${fileName}.html`)
          console.log('end')
          res.end();
        })
    } ,function(err) {
      console.log('ao tentar pegar noticia',err)
    })
    },function(err) {
      console.log('ao pegar link encurtado',err)
    })
  }, function(err) {
    console.log('ao descriptografar', err)
  })
}
module.exports = handlers