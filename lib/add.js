var fs = require('fs-extra')
var c = require('chalk')
var path = require('path')
var isDir = require('is-directory')
var util = require(__dirname + '/util')
var conceptsDir = process.cwd() + '/concepts'
var dialectsDir = process.cwd() + '/dialects'
var templateDir = __dirname + '/../templates'

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
console.log('A:', conceptIndex, conceptIndexCandidate)
  // if the dir does not exist
  fs.mkdirpSync(targetConceptDir)

  // if the concept index was specified, shift the existing files names after the index
  if (indexSpecified) incrementFileNames(targetConceptDir, conceptIndex, conceptIndexCandidate)

  // create the new concept file
  fs.ensureFileSync(newConceptFilePath)
  // if the concept string was specified, write it to the file
  if (concept) fs.writeFileSync(newConceptFilePath, concept + '\n')
console.log('B:', conceptIndex, conceptIndexCandidate)
  // update the dialect files to reflect the new change
  if (fs.existsSync(dialectsDir)) updateDialectFiles(targetConceptDir, conceptIndex, conceptIndexCandidate)

}

// when a new concept file is added in the middle, the corresponding dialect files must also be updated
function updateDialectFiles(sourceDir, startingIndex, highestIndex) {
console.log('C:', startingIndex, highestIndex)
  fs.readdirSync(dialectsDir).forEach(function (tribe) {
    var tribeDirPath = dialectsDir + '/' + tribe
    fs.readdirSync(tribeDirPath).forEach(function (locality) {

      (function (sourceDir, startingIndex, highestIndex) {
        var sourceConceptPath = sourceDir + '/' + startingIndex + '.txt'
        var localityDirPath = dialectsDir + '/' + tribe + '/' + locality
        var dialectConceptDir = localityDirPath + sourceDir.split('concepts')[1]
        var dialectConceptPath = dialectConceptDir + '/' + startingIndex + '.txt'
        // console.log(sourceDir)
        // console.log(localityDirPath)
        console.log(highestIndex, startingIndex)

        // add a new file, no id shifting required
        if (highestIndex === startingIndex) {
          var conceptString = fs.readFileSync(sourceConceptPath).toString().trim()
          var dialectTemplate = fs.readFileSync(templateDir + '/dialect.txt').toString()
          var dialectString = dialectTemplate.replace('#ENTRY#', conceptString)
          fs.writeFileSync(dialectConceptPath, dialectString)
        // a file needs to be added at in index, shift the existing file ids
        } else {
          // console.log(dialectConceptDir)
          while (highestIndex >= startingIndex) {
            console.log(highestIndex, ' to ', highestIndex + 1)
            var oldName = dialectConceptDir + '/' + highestIndex + '.acf'
            var newName = dialectConceptDir + '/' + (highestIndex + 1) + '.acf'
            console.log(oldName, newName)
            fs.renameSync(oldName, newName)
            highestIndex--
          }
        }

      })(sourceDir, startingIndex, highestIndex)

    })

  })

}

// when a file edited or added in concepts, reflect the change in the dialects
function incrementFileNames(targetDir, startingIndex, currentHighestIndex) {

  if (currentHighestIndex > startingIndex) highestCounterIndex = currentHighestIndex - 1

  while (highestCounterIndex >= startingIndex) {
    //console.log(currentHighestIndex, ' to ', currentHighestIndex + 1)
    var oldName = targetDir + '/' + highestCounterIndex + '.txt'
    var newName = targetDir + '/' + (highestCounterIndex + 1) + '.txt'
    fs.renameSync(oldName, newName)
    highestCounterIndex--
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
