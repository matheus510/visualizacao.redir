var fs = require('fs');

var workers = {};
workers.checkExpiry = function(){
  var basePath = './static';
  fs.readdir(basePath, function (err, files) {
    if(err) console.log(err);
    for (var i = 0, iLen = files.length; i < iLen; i++){
      var filePath = `${basePath}/${files[i]}`;

      fs.stat(filePath, function(err, stats){
        // obtem a data de criação em milisegundos
        var dataCriacao = stats.birthtimeMs
        // se a data de criação for 24h menor que a data atual
        if((Date.now() - (1000 * 60 * 60 * 24)) >= dataCriacao){
          fs.unlink(filePath, function(err){
            if (!err) console.log('Files could not be expired correctly')
          })
        }
      })
    }
  })
};

workers.loop = function(){
  setInterval(function(){
    workers.checkExpiry();
  },1000 * 60 * 60);
};

workers.init = function () {
  // checa expiry quando começa
  workers.checkExpiry();

  // inicializa o loop
  workers.loop()
}

module.exports = workers