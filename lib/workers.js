//
// Workers file
//

// Dependencies
var fs = require('fs');

// Create container for all workers
var workers = {};

// Worker for checking expiry date and deletion (in case of expired file)
workers.checkExpiry = function(){
  var basePath = './static';
  fs.readdir(basePath, function (err, files) {
    if(err) console.log(err);
    for (var i = 0, iLen = files.length; i < iLen; i++){
      var filePath = `${basePath}/${files[i]}`;

      fs.stat(filePath, function(err, stats){

        // Obtain creation date in milliseconds
        var creationDate = stats.birthtimeMs

        // If creation date is 24h older than now, delete
        if((Date.now() - (1000 * 60 * 60 * 24)) >= creationDate){
          fs.unlink(filePath, function(err){
            if (!err) {
              console.log('Files expired correctly')
            } else {
              console.log('Files could not be expired correctly', err)
            }
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
  // Initial check, when service is initialized
  workers.checkExpiry();

  // Initialize the loop for further expirations
  workers.loop()
}

module.exports = workers