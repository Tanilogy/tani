var fs = require('fs-extra')
var c = require('chalk')
var path = require('path')
var help = require(__dirname + '/help')
var dialectsDir = process.cwd() + '/dialects'

module.exports = function (argv) {

  if (argv.all) fs.removeSync(dialectsDir)
  else if (argv._.length === 2) {

    var temp = argv._[1].split('/')

    if (temp.length === 1) {
      var tribe = temp[0].toLowerCase()
      var dirPath = dialectsDir + '/' + tribe
      fs.removeSync(dirPath)
    }
    else if (temp.length === 2) {
      var tribe = temp[0].toLowerCase()
      var locality = temp[1].toLowerCase()
      var dirPath = dialectsDir + '/' + tribe + '/' + locality
      fs.removeSync(dirPath)
    }

  } else {
    help()
  }

}
