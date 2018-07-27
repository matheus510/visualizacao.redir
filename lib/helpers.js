//
// Helpers file
//

// Dependencies
let crypto = require('crypto')
let http = require('http')

// Create a container for all helpers
let helpers = {}

helpers.decrypt = function(txt){
  let http_options = {
    "host": 'cloud.boxnet.com.br',
    "path": '/api/criptografia/descriptografar?texto='+txt,
    "method": 'GET',
    "headers": {
        "Authorization": "Basic YmFyYmFhOmJhcmJhYQ=="
    }
  }
  let request = new Promise(function (resolve, reject){
    let req = http.request(http_options, function(res){

      if (res.statusCode < 200 || res.statusCode >= 300){
        // First reject
        reject(new Error('statusCode=' + res.statusCode))
        return
      }

      let body = []

      res.on('data', function(chunk){
          body.push(chunk)
      })

      res.on('end', function(){
        try {
          body = JSON.parse(Buffer.concat(body).toString())
          resolve(body)
        } catch(e){
          reject(e)
          return
        }
      })
    })
    req.on('error', function(err){
        // Second reject
        reject(err)
    })
    req.end()
    })
    return Promise.resolve(request).then(function(data){
      return data
    })
}
helpers.getNoticia = function(idNoticia, idProdutoMvc){
  let postData = `${idNoticia}&${idProdutoMvc}`
  if (Number.parseInt(idNoticia) !== NaN) {
    postData = `idNoticia=${idNoticia}&idProdutoMvc=${idProdutoMvc}`
  }

  let http_options_noticia = {
    "host": 'cloud.boxnet.com.br',
    "path": '/api/Noticia/Get?'+postData+'&retornarTags=false',
    "method": 'GET',
    "headers": {
        "Authorization": "Basic YmFyYmFhOmJhcmJhYQ=="
    }
  }
  let requestNoticia = new Promise(function (resolve, reject){
    let req = http.request(http_options_noticia, function(res){
      if (res.statusCode < 200 || res.statusCode >= 300){
        
        // First reject
        reject(new Error('statusCode=' + res.statusCode))
        return
      }
      let body = []
      res.on('data', function(chunk){
          body.push(chunk)
      })
      res.on('end', function(){
        try {
            body = JSON.parse(Buffer.concat(body).toString())
            resolve(body)
        } catch(e){
            reject(e)
            return
        }
      })
    })
    req.on('error', function(err){
        // Second reject
        reject(err)
    })
    req.end()
  })
  
  return Promise.resolve(requestNoticia).then(function(data){
    return data
  })
}
helpers.shortLink = function (idNoticia, idProdutoMvc){
  console.log(idNoticia, idProdutoMvc)
  let postData = `${idNoticia}&${idProdutoMvc}`
  if (Number.parseInt(idNoticia) !== NaN) {
    postData = `idNoticia=${idNoticia}&idProdutoMvc=${idProdutoMvc}`
  }
  console.log(postData)
  let http_options_encurtador = {
    "host": 'cloud.boxnet.com.br',
    "path": '/api/NoticiaCompartilhada/Obter?'+postData,
    "method": 'POST',
    "headers": {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic YmFyYmFhOmJhcmJhYQ=="
    }
  }
  let requestEncurtador = new Promise(function (resolve, reject){
    let req = http.request(http_options_encurtador, function(res){
      if (res.statusCode < 200 || res.statusCode >= 300){
        console.log(res)
        // First reject
        reject(new Error('statusCode=' + res.statusCode))
        return
      }
      let body = []
      res.on('data', function(chunk){
          body.push(chunk)
      })
      res.on('end', function(){
        try {
            body = JSON.parse(Buffer.concat(body).toString())
            resolve(body)
        } catch(e){
            reject(e)
            return
        }
      })
    })
    req.on('error', function(err){
        // Second reject
        reject(err)
    })
    req.write(postData)
    req.end()
  })
  
  return Promise.resolve(requestEncurtador).then(function(data){
    return data
  })

}
helpers.validateEmail = function (str){
  let emailValidationExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return emailValidationExp.test(String(str).toLowerCase())
}

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str){
  try{
    let obj = JSON.parse(str)
    return obj
  } catch(e){
    return {}
  }
}

// Create a SHA256 hash
helpers.hash = function(str){
  if(typeof(str) == 'string' && str.length > 0){
    let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
    return hash
  } else {
    return false
  }
}
// Create random strings
helpers.createRandomString = function(length){
  
  if(length){
    //initialize the string
    let str = ''
    // set the characters
    let allowedCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++){
      str+=allowedCharacters.charAt(Math.floor(Math.random() * allowedCharacters.length))
    }
    return str
  } else {
    return false
  }

}

helpers.formatDate = function(str){
  // accepted format = 2018-07-17T06:08:00
  let data = str.substring(0, 18)
  let dataAno = data.substring(0, 4)
  let dataMes = data.substring(5, 7)
  let dataDia = data.substring(8, 10)
  let dataHora = data.substring(11, 13)
  let dataMinuto = data.substring(14, 16)
  let dataFormatada = `${dataDia}/${dataMes}/${dataAno} ás ${dataHora}:${dataMinuto}`
  return dataFormatada
}
module.exports = helpers
