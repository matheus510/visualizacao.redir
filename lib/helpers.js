//
// Helpers file
//

// Dependencies
var crypto = require('crypto');
var http = require('http')
var fs = require('fs');

// Create a container for all helpers
var helpers = {}

helpers.decrypt = function(txt) {
  var http_options = {
        "host": 'cloud.boxnet.com.br',
        "path": '/api/criptografia/descriptografar?texto='+txt,
        "method": 'GET',
        "headers": {
            "Authorization": "Basic YmFyYmFhOmJhcmJhYQ=="
        }
      };
  var request = new Promise(function (resolve, reject){
    var req = http.request(http_options, function(res) {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        // First reject
        reject(new Error('statusCode=' + res.statusCode));
        return;
      }
      var body = [];
      res.on('data', function(chunk) {
          body.push(chunk);
      });
      res.on('end', function() {
        try {
            body = JSON.parse(Buffer.concat(body).toString());
            resolve(body);
        } catch(e) {
            reject(e);
            return;
        }
      });
    });
    req.on('error', function(err) {
        // Second reject
        reject(err);
    });
    req.end()
    })
    return Promise.resolve(request).then(function(data) {
      return data
    })
}
helpers.getNoticia = function(nParametros, arrayParametros){
  var idProdutoMvc = nParametros === 3 ? arrayParametros[2] : arrayParametros[1]
  var idNoticia = nParametros === 3 ? arrayParametros[1] : arrayParametros[0]
  var http_options_noticia = {
    "host": 'cloud.boxnet.com.br',
    "path": '/api/Noticia/Get?'+ idNoticia + '&' + idProdutoMvc + '&retornarTags=false',
    "method": 'GET',
    "headers": {
        "Authorization": "Basic YmFyYmFhOmJhcmJhYQ=="
    }
  };
  var requestNoticia = new Promise(function (resolve, reject){
    var req = http.request(http_options_noticia, function(res) {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        
        // First reject
        reject(new Error('statusCode=' + res.statusCode));
        return;
      }
      var body = [];
      res.on('data', function(chunk) {
          body.push(chunk);
      });
      res.on('end', function() {
        try {
            body = JSON.parse(Buffer.concat(body).toString());
            resolve(body);
        } catch(e) {
            reject(e);
            return;
        }
      });
    });
    req.on('error', function(err) {
        // Second reject
        reject(err);
    });
    req.end()
  })
  
  return Promise.resolve(requestNoticia).then(function(data) {
    return data
  })
}
helpers.shortLink = function (idNoticia, idProdutoMvc) {

  var postData = `${idNoticia}&${idProdutoMvc}`
  var http_options_encurtador = {
    "host": 'cloud.boxnet.com.br',
    "path": '/api/NoticiaCompartilhada/Obter',
    "method": 'POST',
    "headers": {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic YmFyYmFhOmJhcmJhYQ=="
    }
  };
  var requestEncurtador = new Promise(function (resolve, reject){
    var req = http.request(http_options_encurtador, function(res) {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        
        // First reject
        reject(new Error('statusCode=' + res.statusCode));
        return;
      }
      var body = [];
      res.on('data', function(chunk) {
          body.push(chunk);
      });
      res.on('end', function() {
        try {
            body = JSON.parse(Buffer.concat(body).toString());
            resolve(body);
        } catch(e) {
            reject(e);
            return;
        }
      });
    });
    req.on('error', function(err) {
        // Second reject
        reject(err);
    });
    req.write(postData);
    req.end();
  })
  
  return Promise.resolve(requestEncurtador).then(function(data) {
    return data
  })

}
helpers.validateEmail = function (str) {
  var emailValidationExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailValidationExp.test(String(str).toLowerCase());
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str){
  try{
    var obj = JSON.parse(str);
    return obj;
  } catch(e){
    return {};
  }
};

// Create a SHA256 hash
helpers.hash = function(str){
  if(typeof(str) == 'string' && str.length > 0){
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};
// Create random strings
helpers.createRandomString = function(length){
  
  if(length){
    //initialize the string
    var str = '';
    // set the characters
    var allowedCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++){
      str+=allowedCharacters.charAt(Math.floor(Math.random() * allowedCharacters.length))
    }
    return str;
  } else {
    return false;
  }

}

helpers.formatDate = function(str){
  // accepted format = 2018-07-17T06:08:00
  var data = str.substring(0, 18);
  var dataAno = data.substring(0, 4);
  var dataMes = data.substring(5, 7);
  var dataDia = data.substring(8, 10);
  var dataHora = data.substring(11, 13);
  var dataMinuto = data.substring(14, 16);
  var dataFormatada = `${dataDia}/${dataMes}/${dataAno} ás ${dataHora}:${dataMinuto}`;
  return dataFormatada;
}
module.exports = helpers
