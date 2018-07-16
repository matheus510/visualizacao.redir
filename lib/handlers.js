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
handlers.visualizacao = function(data, res){
  var acceptableMethods = ['get'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._visualizacao[data.method](data,res);
  } else {
    res.writeHead(405);
    res.end();
  }
}
handlers._redir = {};
handlers._visualizacao = {};
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
      
      // Obter a noticia para montar pequeno preview
      helpers.getNoticia(nParametros, arrayParametros).then(function (resNoticia) {
      
      // Atribuir as informações nas tags meta a serem adicionadas
      var conteudo = 
      `<html>
        <head>
          <meta http-equiv="refresh" content="0; url=${dataEncurtador.Url}">
          <meta property="og:title" content="${resNoticia.Titulo.trim()}">
          <meta property="og:description" content="${resNoticia.Conteudo.substring(0,65).trim()}">
          <meta property="og:url" content="http://visualizacao.boxnet.com.br/">
        </head>
        <body></body>
      </html>
      `;
      // Obter template base
      res.write(conteudo)
      console.log('end')
      res.end();
      } ,function(err) {
      console.log(err)
    })
    },function(err) {
      console.log(err)
    })
  }, function(err) {
    console.log(err)
  })
}
module.exports = handlers