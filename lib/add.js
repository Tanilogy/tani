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
  var indexSpecified = false
  var fileName
  var newConceptFilePath
  var concept = argv._[2]

  var pathArray = argv._[1].split('@')
  if (pathArray.length === 2) {
    conceptPath = pathArray[0]
    conceptIndex = pathArray[1]
    indexSpecified = true
  } else {
    conceptPath = argv._[1]
  }

  if (!(conceptPath.split('/')[0] in util.concepts)) {
    console.log(c.red('\n Invalid concept type "'+ conceptPath.split('/')[0] +'"\n'))
    return console.log(' Supported types: ' + Object.keys(util.concepts).toString().replace(/,/g, ', ') + '\n')
  }

  var targetConceptDir = conceptsDir + '/' + conceptPath
  var conceptIndexCandidate = getNextFileId(targetConceptDir)

  if (indexSpecified) {
    // concept Index can't be more than the immediate highest number
    if (conceptIndex > conceptIndexCandidate) {
      conceptIndex = conceptIndexCandidate
      indexSpecified = false
    }
  } else {
    conceptIndex = conceptIndexCandidate
  }

  fileName = conceptIndex + '.txt'
  newConceptFilePath = targetConceptDir + '/' + fileName

  // if the dir does not exist
  fs.mkdirpSync(targetConceptDir)

  if (indexSpecified) {
    incrementFileNames(targetConceptDir, conceptIndex, conceptIndexCandidate - 1)
  }

  fs.ensureFileSync(newConceptFilePath)
  if (concept) fs.writeFileSync(newConceptFilePath, concept + '\n')

}


// when a file edited or added in concepts, reflect the change in the dialects
function incrementFileNames(targetDir, startingIndex, currentHighestIndex) {

  if (!currentHighestIndex) currentHighestIndex = getNextFileId(targetDir) - 1

  while (currentHighestIndex >= startingIndex) {
    //console.log(currentHighestIndex, ' to ', currentHighestIndex + 1)
    var oldName = targetDir + '/' + currentHighestIndex + '.txt'
    var newName = targetDir + '/' + (currentHighestIndex + 1) + '.txt'
    fs.renameSync(oldName, newName)
    currentHighestIndex--
  }

}


// get the autoincremented next id for a file in a dir
function getNextFileId(targetDir) {

  if (!fs.existsSync(targetDir)) return 1;

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
