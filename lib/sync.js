var fs = require('fs-extra')
var path = require('path')
var util = require(__dirname + '/util')
var isDir = require('is-directory')
var conceptsDir = process.cwd() + '/concepts'
var dialectsDir = process.cwd() + '/dialects'

module.exports = function (argv) {

  if (!fs.existsSync(dialectsDir)) return console.log('\n Nothing to sync\n')

  if (argv.all) {
    syncCreatedConcepts(conceptsDir)
    syncDeletedConcepts(conceptsDir)
  // called by delete.js
  } else if (argv._[0] === 'delete') {
    var conceptPath = conceptsDir + '/' + argv._[1]
    if (argv.file) conceptPath = conceptsDir + '/' + argv._[1].replace('@', '/') + '.txt'
    syncDeletedConcepts(conceptPath)
  } else {
    console.log(' For now use the --all flag!')
  }
}

// create new dialect files from concept files
function syncCreatedConcepts(candidateFile) {

  if (isDir.sync(candidateFile)) {

    var currentDir = candidateFile
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
          syncFile(currentFilePath)
        }

      }
    })

  } else {
    syncFile(candidateFile)
  }

}

// sync a sigle concept file
function syncFile(concepFilePath) {
  // read tribes
  fs.readdirSync(dialectsDir).forEach(function (tribe) {
    // make sure ignored files are not processed
    if (util.ignore.indexOf(tribe) === -1) {
      // read localities
      var tribeDir = dialectsDir + '/' + tribe
      fs.readdirSync(tribeDir).forEach(function (locality) {

        // make sure ignored files are not processed
        if (util.ignore.indexOf(locality) === -1) {
          var localityPath = tribe + '/' + locality
          var targetFilePath = concepFilePath.replace(conceptsDir, dialectsDir + '/' + localityPath)
          // dialect file does not exist, create it
          if (!fs.existsSync(targetFilePath)) {
            util.generateDialectFile(concepFilePath, targetFilePath)
          // check if anything needs to be updated in the existing dialect file
          } else {
            util.updateDialectFile(concepFilePath, targetFilePath)
          }
        }

      })

    }

  })
}

// delete dialect files, if concept files are deleted
function syncDeletedConcepts(argFile) {

  fs.readdirSync(dialectsDir).forEach(function (tribe) {

    // make sure ignored files are not processed
    if (util.ignore.indexOf(tribe) === -1) {

      var tribeDirPath = dialectsDir + '/' + tribe
      fs.readdirSync(tribeDirPath).forEach(function (locality) {

        // make sure ignored files are not processed
        if (util.ignore.indexOf(locality) === -1) {

          var localityDirPath = dialectsDir + '/' + tribe + '/' + locality
          fs.readdirSync(localityDirPath).forEach(function (conceptType) {

            // make sure ignored files are not processed
            if (util.ignore.indexOf(conceptType) === -1) {

              var localConceptPath = localityDirPath + '/' + conceptType
              if (isDir.sync(localConceptPath)) {
                fs.readdirSync(localConceptPath).forEach(function (entry) {

                  // make sure ignored files are not processed
                  if (util.ignore.indexOf(entry) === -1) {

                    var entryPath = localConceptPath + '/' + entry
                    var localPathSegment = 'dialects' + '/' + tribe + '/' + locality
                    var conceptPath = entryPath.replace(localPathSegment, 'concepts')
                    if (!fs.existsSync(conceptPath)) fs.removeSync(entryPath)

                  }

                })

              }

            }

          })

        }

      })

    }

  })

}
