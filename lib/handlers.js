// handlers file

// dependencies
var helpers = require('./helpers');
var fs = require('fs');
var path = require('path')
// create handlers object
var handlers = {};
handlers.notFound = function(data,callback){
  callback(404);
};

handlers.redir = function(data, callback){
  var acceptableMethods = ['get'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._redir[data.method](data,callback);
  } else {
    callback(405);
  }
};
handlers.visualizacao - function(data, callback){
  var acceptableMethods = ['get'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._visualizacao[data.method](data,callback);
  } else {
    callback(405);
  }
}
handlers._redir = {};
handlers._visualizacao = {};
handlers._redir.get = function(data, res){
  var dataToken = data.queryStringObject.t;
  helpers.descriptografar(dataToken).then(function (resDe) {
    const expressao = new RegExp('([^=&?]+)=([^&]+)', 'g')
    var arrayParametros = resDe.match(expressao)
    var nParametros = arrayParametros.length
    var idProdutoMvc = nParametros === 3 ? arrayParametros[2] : arrayParametros[1]
    var idNoticia = nParametros === 3 ? arrayParametros[1] : arrayParametros[0]
    helpers.linkEncurtado(idNoticia, idProdutoMvc).then(function (dataEncurtador) {
      var urlEnc = dataEncurtador.Url
      var nomeDir = urlEnc.substring((urlEnc.indexOf('.br') + 4),urlEnc.length)
      helpers.getNoticia(nParametros, arrayParametros).then(function (resNoticia) {
      // Return the resonse
      

      var conteudo = `
            <meta http-equiv="refresh" content="0; URL='${urlEnc}'" />
            <meta property="og:title" content="${resNoticia.Titulo.trim()}">
            <meta property="og:description" content="${resNoticia.Conteudo.substring(0,65).trim()}">
            <meta property="og:url" content="http://visualizacao.boxnet.com.br/">`;

        var indexOriginal = fs.readFileSync('./templates/index.html')

        var indexNovo = indexOriginal.toString('utf8').replace('<!--addHeaders-->', conteudo);
        const config = { folderPath: `./${nomeDir}`};
/*         AWS.config.update({ accessKeyId: credentials.aws_access_key_id, secretAccessKey: credentials.aws_secret_access_key});

        // initialize S3 client
        const s3 = new AWS.S3({ signatureVersion: 'v4' }); */

        // resolve full folder path
        const folderPath = path.join(`./${config.folderPath}/`);
        // get of list of files from 'dist' directory
          res.write(indexNovo)
          res.end();


        
          /* res.writeHead(301,
            {Location: `http://ec2-54-89-249-90.compute-1.amazonaws.com:5000/visualizacao?t=${nomeDir}`}
          );
          res.end(); */
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