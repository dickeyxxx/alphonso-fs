'use strict';
/*jshint -W079 */

let util = require('./util');
let fs = require('mz/fs');
let Bluebird = require('bluebird');
let path = require('path');
let mkdirp = require('mkdirp');
let config;



function writePackage(filename, content) {
  filename = path.join(config.directory, filename);
  return new Bluebird(function(fulfill, reject) {
    let dir = path.dirname(filename);
    mkdirp(dir, function(err) {
      if (err) {
        reject(err);
      }
      else {
        let wstream = fs.createWriteStream(filename);
        content.pipe(wstream);
        wstream.on('finish', function() {
          fulfill()
        });

      }
    });
  });
}

function writeContent(filename, content) {
  filename = path.join(config.directory, filename);
  return new Bluebird(function(fulfill, reject) {
    let dir = path.dirname(filename);
    mkdirp(dir, function(err) {
      if (err) {
        reject(err);
      }
      else {
        fulfill(fs.writeFile(filename, content));
      }
    });
  });
}

function stream(key) {
  return fs.exists(path.join(config.directory, key)).then(function(exists) {
    if (exists) {
      return fs.createReadStream(path.join(config.directory, key));
    }
    else {
      return;
    }
  }).catch(function(err) {
    throw new Error('Error downloading ' + key + '\n' + err);
  })
}

function download(key) {
  return stream(key)
    .then(function(res) {
      if (!res) {
        return;
      }
      return util.concat(res);
    });
}

fs.stream = stream;
fs.download = download;
fs.fileDownload = function(key){
  return download(path.join(config.directory, key));
}
fs.writePackage = writePackage;
fs.writeContent = writeContent;
fs.fileExists = function(key){
  return fs.exists(path.join(config.directory, key));
}
fs.streamFile = function(key){
  return fs.readFile(path.join(config.directory, key));
}

fs.putBufferAsync = function(data, path, config){
  // console.log( typeof data, data, path, config)
  return fs.writeContent(path,data, config);
}

fs.putStreamAsync = function(content, key, config){
  return fs.writePackage(key, content, config);
}
module.exports = function(conf, penv) {
  config = conf;
  config.directory =  penv['directory'] || config.directory;
  return fs;
};
