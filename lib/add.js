var fs = require('fs-extra')
var c = require('chalk')
var path = require('path')
var isDir = require('is-directory')
var util = require(__dirname + '/util')
var conceptsDir = process.cwd() + '/concepts'
var dialectsDir = process.cwd() + '/dialects'

module.exports = function (argv) {

  if (argv._.length < 2) {
    console.log(c.red('\n Invalid format\n'))
    console.log(' Use the format ' + c.bold('tani add <path> [content]'))
    console.log(' Ex: tani add n "Sky"')
    console.log(' Ex: tani add n/animals@2 "Mithun"')
    return console.log(' Ex: tani add n/animals "Elephant"\n')
  }

  var conceptPath
  var conceptIndex
  var fileName
  var newConceptFilePath
  var concept = argv._[2]

  var pathArray = argv._[1].split('@')
  if (pathArray.length === 2) {
    conceptPath = pathArray[0]
    conceptIndex = pathArray[1]
  } else {
    conceptPath = argv._[1]
  }

  var targetConceptDir = conceptsDir + '/' + conceptPath
  if (!conceptIndex) {
    conceptIndex = getNextFileId(targetConceptDir)
  }

  fileName = conceptIndex + '.txt'
  newConceptFilePath = targetConceptDir + '/' + fileName

  fs.ensureFileSync(newConceptFilePath)
  if (concept) fs.writeFileSync(newConceptFilePath, concept + '\n')

}


// when a file edited or added in concepts, reflect the change in the dialects
function updateDialects(conceptFilePath) {




}


// get the autoincremented next id for a file in a dir
function getNextFileId(targetDir) {

  var highestNumber = 0
  fs.readdirSync(targetDir).forEach(function (file) {
    var filePath = targetDir + '/' + file
    if (!isDir.sync(filePath)) {
      var candidate = parseInt(file)
      if (candidate > highestNumber) {
        highestNumber = candidate
      }
    }
  })

  return ++highestNumber

}
