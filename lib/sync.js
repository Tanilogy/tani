var fs = require('fs-extra')
var path = require('path')
var util = require(__dirname + '/util')
var isDir = require('is-directory')
var conceptsDir = process.cwd() + '/concepts'
var dialectsDir = process.cwd() + '/dialects'

/*

TODO:

1. currently `delete` uses `sync` for syncing deletes, in future `add` also should use `sync`

*/

module.exports = function (argv) {

  if (!fs.existsSync(dialectsDir)) return console.log('\n Nothing to sync\n')

  if (argv.all) {
    syncCreatedConcepts(conceptsDir)
    syncDeletedConcepts(conceptsDir)
  // called by delete.js
  } else if (argv._[0] === 'delete') {
    var conceptPath = conceptsDir + '/' + argv._[1]
    if (argv.file) conceptPath += '.txt'
    syncDeletedConcepts(conceptPath)
  }
}

// create new dialect files from concept files
function syncCreatedConcepts(file) {

  return console.log(file)

  var files = fs.readdirSync(currentDir)
  files.forEach(function (file) {

    // if this file is not to be ignored
    if (util.ignore.indexOf(file) === -1) {

      var currentFilePath = currentDir + '/' + file
      var stat = fs.statSync(currentFilePath);
      if (stat.isDirectory()) {
        return syncCreatedConcepts(currentFilePath)
      }
      else {
        // read tribes
        fs.readdirSync(dialectsDir).forEach(function (tribe) {
          // read localities
          var tribeDir = dialectsDir + '/' + tribe
          fs.readdirSync(tribeDir).forEach(function (locality) {
            var localityPath = tribe + '/' + locality
            var targetFilePath = currentFilePath.replace(conceptsDir, dialectsDir + '/' + localityPath)

            // dialect file does not exist, create it
            if (!fs.existsSync(targetFilePath)) {
              util.generateDialectFile(currentFilePath, targetFilePath)
            // check if anything needs to be updated in the existing dialect file
            } else {

            }

          })
        })

      }

    }
  })
}

// delete dialect files, if concept files are deleted
function syncDeletedConcepts(argFile) {

  fs.readdirSync(dialectsDir).forEach(function (tribe) {
    var tribeDirPath = dialectsDir + '/' + tribe
    fs.readdirSync(tribeDirPath).forEach(function (locality) {
      var dialectPath = 'dialects/' + tribe + '/' + locality
      var targetFilePath = argFile.replace('concepts', dialectPath)
      fs.removeSync(targetFilePath)
    })
  })

}
