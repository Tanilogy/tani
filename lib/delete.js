var fs = require('fs-extra')
var c = require('chalk')
var path = require('path')
var sync = require(__dirname + '/sync.js')

module.exports = function (argv) {

  var conceptsDir = process.cwd() + '/concepts'
  var dialectsDir = process.cwd() + '/dialects'

  // delete all concepts
  if (argv.all) {
    fs.removeSync(conceptsDir)
    return fs.removeSync(dialectsDir)
  }

  var conceptDir = argv._[1]
  var conceptPath = conceptsDir + '/' + conceptDir

  // delete concept dir
  if (fs.existsSync(conceptPath)) {

    fs.removeSync(conceptPath)
    sync(argv)

  } else {
    return console.log(c.bold('\n %s') + c.red(' does not exists\n'), conceptPath)
  }

}
