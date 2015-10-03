var fs = require('fs-extra')
var path = require('path')
var util = require(__dirname + '/util')
var conceptsDir = process.cwd() + '/concepts'
var dialectsDir = process.cwd() + '/dialects'

module.exports = function (argv) {

  if (!fs.existsSync(dialectsDir)) {
    return console.log('\n Nothing to sync\n')
  }

  var concepts = fs.readdirSync(conceptsDir)
  concepts.forEach(function (file) {
    if (util.ignore.indexOf(file) === -1) {
      syncConcept(conceptsDir + '/' + file)
    }
  })

}

function syncConcept(currentDir) {

  var files = fs.readdirSync(currentDir)
  files.forEach(function (file) {

    // if this file is not to be ignored
    if (util.ignore.indexOf(file) === -1) {

      var currentFilePath = currentDir + '/' + file
      var stat = fs.statSync(currentFilePath);
      if (stat.isDirectory()) {
        return syncConcept(currentFilePath)
      }
      else {

        // read tribes
        fs.readdirSync(dialectsDir).forEach(function (tribe) {
          // read localities
          var tribeDir = dialectsDir + '/' + tribe
          fs.readdirSync(tribeDir).forEach(function (locality) {
            var localityPath = tribe + '/' + locality
            var targetFilePath = currentFilePath.replace(conceptsDir, dialectsDir + '/' + localityPath)
            if (!fs.existsSync(targetFilePath)) {
              util.generateDialectFile(currentFilePath, targetFilePath)
            }
          })
        })

      }

    }
  })
}
