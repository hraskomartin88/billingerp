var fs = require('fs'),
  async = require('async'),
  db = require('./mysql'),
  csv = require('csv'),
  path = require('path');

var csvParserOptions = {
  delimiter:';',
  relax:true,
  columns:true,
  rowDelimeter: '\n'
};

exports.processPriceImport = function(filename,callback){
  var output = [];

  var csvparser = csv.parse(csvParserOptions);
  var stream = fs.createReadStream(path.join('./public/upload/', filename),{encoding:'utf-8'});
  var rowCount = 0;
  var transformer = csv.transform(function(data){
    console.log(data);
    return data;
  });
  transformer.on('readable', function(){
    while(row=transformer.read()){
      output.push(row);
    }
  });
  transformer.on('error', function(err){
    console.log(err.message);
  });
  transformer.on('finish', function(){
    callback(output);
  });
  stream.pipe(csvparser).pipe(transformer);
}

exports.processFileLogic = function(filename, callback){
  var output = [];

  var csvparser = csv.parse(csvParserOptions);
  var stream = fs.createReadStream(path.join('./public/upload/', filename),{encoding:'utf-8'});
  var rowCount = 0;
  var transformer = csv.transform(function(data){
    var tmp = data.COUNTRY.split("_");
    data.alpha2 = tmp[0];
    data.german_formal = tmp[1];
    delete data.COUNTRY;
    return data;
  });
  transformer.on('readable', function(){
    while(row=transformer.read()){
      output.push(row);
    }
  });
  transformer.on('error', function(err){
    console.log(err.message);
  });
  transformer.on('finish', function(){
    callback(output);
  });
  stream.pipe(csvparser).pipe(transformer);
  /*console.log(filename);
  setTimeout(function(){
    callback("przlogic");
  },5000);*/
}