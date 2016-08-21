var fs = require('fs-extra')
var c = require('chalk')
var path = require('path')
var sync = require(__dirname + '/sync.js')
var isDir = require('is-directory')
var conceptsDir = process.cwd() + '/concepts'
var dialectsDir = process.cwd() + '/dialects'

module.exports = function (argv) {

  // delete all concepts
  if (argv.all) {
    fs.removeSync(conceptsDir)
    return fs.removeSync(dialectsDir)
  }

  var conceptPath = conceptsDir + '/' + argv._[1]

  // delete concept dir
  if (isDir.sync(conceptPath)) {

    fs.removeSync(conceptPath)
    sync(argv)

  } else if (fs.existsSync(conceptPath + '.txt')) {

    fs.removeSync(conceptPath + '.txt')
    argv.file = true
    sync(argv)

  } else {
    return console.log(c.bold('\n %s') + c.red(' does not exists\n'), conceptPath)
  }

}
