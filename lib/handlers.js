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

        var IndexNovo = indexOriginal.toString('utf8').replace('<!--addHeaders-->', conteudo);
        const config = { folderPath: `./${nomeDir}`};
/*         AWS.config.update({ accessKeyId: credentials.aws_access_key_id, secretAccessKey: credentials.aws_secret_access_key});

        // initialize S3 client
        const s3 = new AWS.S3({ signatureVersion: 'v4' }); */

        // resolve full folder path
        const folderPath = path.join(`./${config.folderPath}/`);

        if (!fs.existsSync(config.folderPath)){
            fs.mkdirSync(config.folderPath);
        }
        fs.writeFileSync(`./${nomeDir}/index.html`,IndexNovo);
        // get of list of files from 'dist' directory
        var files = fs.readdirSync(folderPath);

          if(!files || files.length === 0) {
            console.log(`provided folder '${folderPath}' is empty or does not exist.`);
            console.log('Make sure your project was compiled!');
            return;
          }

/*           // for each file in the directory
          for (const fileName of files) {

            // get the full path of the file
            const filePath = path.join(folderPath, fileName);
            console.log(filePath)
            // ignore if directory
            if (fs.lstatSync(filePath).isDirectory()) {
              continue;
            }

            // read file contents
            fs.readFile(filePath, (error, fileContent) => {
              // if unable to read file contents, throw exception
              if (error) { throw error; }
              console.log({
                "Bucket": `${config.s3BucketName}/`,
                "Key": `${nomeDir}/${fileName}`,
                "filePath": filePath
              })
              // upload file to S3
              s3.putObject({
                Bucket: config.s3BucketName,
                Key: `${nomeDir}/${fileName}`,
                ACL:'public-read',
                Body: fileContent
              }, (res) => {
                console.log(res)
                var deleteFolderRecursive = function(path) {
                  if (fs.existsSync(path)) {
                    fs.readdirSync(path).forEach(function(file, index){
                      var curPath = path + "/" + file;
                      if (fs.lstatSync(curPath).isDirectory()) { // recurse
                        deleteFolderRecursive(curPath);
                      } else { // delete file
                        fs.unlinkSync(curPath);
                      }
                    });
                    fs.rmdirSync(path);
                  }
                  deleteFolderRecursive(folderPath)
                };
                if(res) {
                  console.log(`Successfully uploaded '${fileContent}'!`);
                }
              }, (err) => {
                console.log(new Error(err))
              });
            });
          }; */
          res.writeHead(301,
            {Location: `http://ec2-54-89-249-90.compute-1.amazonaws.com:5000/visualizacao?t=${nomeDir}`}
          );
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
handlers._visualizacao.get = function(data, res){
  var dataToken = data.queryStringObject.t;
  fs.readFile(`${dataToken}/index.html`, function (error, pgres) {
    if (error) {
        res.writeHead(404);
        res.write('Contents you are looking are Not Found');
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(pgres);
    }
     
    res.end();
});
}
module.exports = handlers