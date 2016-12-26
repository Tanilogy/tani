var fs = require('fs-extra')
var c = require('chalk')
var path = require('path')
var isDir = require('is-directory')
var util = require(__dirname + '/util')
var conceptsDir = process.cwd() + '/concepts'
var dialectsDir = process.cwd() + '/dialects'

var getNextFileId = util.getNextFileId

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
    return sync(argv)
  }

  conceptPath = conceptsDir + '/' + argv._[1].replace('@', '/') + '.txt'

  if (fs.existsSync(conceptPath)) {

    var conceptDir = path.dirname(conceptPath)
    var fileIndex = path.basename(conceptPath, '.txt')
    var currentHighestIndex = getNextFileId(conceptDir) - 1

    fs.removeSync(conceptPath)

    decrementFileNames(conceptDir, fileIndex, currentHighestIndex)
    updateDialectFiles(conceptDir, fileIndex, currentHighestIndex)

  } else {
    return console.log(c.bold('\n %s') + c.red(' does not exists\n'), conceptPath)
  }

}

function decrementFileNames(targetDir, fileIndex, currentHighestIndex) {

  fileIndex = +fileIndex

  // increment not required
  if (fileIndex === currentHighestIndex) return

  var indexCounter = fileIndex + 1

  while (indexCounter <= currentHighestIndex) {
    //console.log(indexCounter, ' to ', indexCounter - 1)
    var oldName = targetDir + '/' + indexCounter + '.txt'
    var newName = targetDir + '/' + (indexCounter - 1) + '.txt'
    fs.renameSync(oldName, newName)
    indexCounter++
  }

}

// when a new concept file is deleted from the middle, the corresponding dialect files must also be updated
function updateDialectFiles(sourceDir, startingIndex, highestIndex) {

  startingIndex = +startingIndex

  fs.readdirSync(dialectsDir).forEach(function (tribe) {

    // make sure ignored files are not processed
    if (util.ignore.indexOf(tribe) === -1) {

      var tribeDirPath = dialectsDir + '/' + tribe
      fs.readdirSync(tribeDirPath).forEach(function (locality) {

        // make sure ignored files are not processed
        if (util.ignore.indexOf(locality) === -1) {

          (function (sourceDir, startingIndex, highestIndex) {

            var sourceConceptPath = sourceDir + '/' + startingIndex + '.txt'
            var localityDirPath = dialectsDir + '/' + tribe + '/' + locality
            var dialectConceptDir = localityDirPath + sourceDir.split('concepts')[1]
            var dialectConceptPath = dialectConceptDir + '/' + startingIndex + '.txt'

            fs.removeSync(dialectConceptPath)

            if (highestIndex !== startingIndex) {
              var indexCounter = startingIndex + 1
              // rename existing file names
              while (indexCounter <= highestIndex) {
                //console.log(indexCounter, 'to', indexCounter-1)
                var oldName = dialectConceptDir + '/' + indexCounter + '.txt'
                var newName = dialectConceptDir + '/' + (indexCounter - 1) + '.txt'
                fs.renameSync(oldName, newName)
                indexCounter++
              }
            }

            //util.generateDialectFile(sourceConceptPath, dialectConceptPath)

          })(sourceDir, startingIndex, highestIndex)

        }

      })

    }

  })

}
