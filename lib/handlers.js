// handlers file

// dependencies
var helpers = require('./helpers');
var fs = require('fs');
/* var AWS = require('aws-sdk') */

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
handlers._redir = {};

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
      var nomeArq = urlEnc.substring((urlEnc.indexOf('.br') + 4),urlEnc.length)
      helpers.getNoticia(nParametros, arrayParametros).then(function (resNoticia) {
      // Return the response
      

      var conteudo = `
        <html>
          <head>
            <meta http-equiv="refresh" content="0; URL='${urlEnc}'" />
            <meta property="og:title" content="${resNoticia.Titulo.trim()}">
            <meta property="og:description" content="${resNoticia.Conteudo.substring(0,65).trim()}">
            <meta property="og:url" content="http://visualizacao.boxnet.com.br/">
          </head>
        </html>`;
        /* AWS.config.update({ accessKeyId: '...', secretAccessKey: '...' });
        if (!fs.existsSync(nomeArq)){
            fs.mkdirSync(dir);
        }
        fs.writeFileSync(`./${nomeArq}/index.html`,conteudo);
        // Read in the file, convert it to base64, store to S3
        fs.readFile(`./${nomeArq}/index.html`, function (err, data) {
          if (err) { throw err; }

          var base64data = new Buffer(data, 'binary');

          var s3 = new AWS.S3();
          s3.client.putObject({
            Bucket: 'banners-adxs',
            Key: 'del2.txt',
            Body: base64data,
            ACL: 'public-read'
          },function (resp) {
          console.log(arguments);
          console.log('Successfully uploaded package.');
        });
 
      });*/
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(conteudo);
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