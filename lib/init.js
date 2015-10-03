'use strict'

var fs = require('fs-extra')
var c = require('chalk')
var safeEval = require('safe-eval')
var path = require('path')
var util = require(__dirname + '/util')
var generate = require(__dirname + '/generate')
var conceptsDir = process.cwd() + '/concepts'
var dialectsDir = process.cwd() + '/dialects'

module.exports = function (argv) {

  if (argv._.length === 1 && argv.system) {
    return generate()
  }

  if (argv._.length > 1) {

    var localityPath = argv._[1]
    var temp = localityPath.split('/')

    if (temp.length < 2) {
      return formatError()
    }

    var tribe = temp[0].toLowerCase()
    var locality = temp[1].toLowerCase()

    // where concept files reside
    var conceptsDirExists = fs.existsSync(conceptsDir)
    // where dialect files will reside
    var localityDialectsDir = process.cwd() + '/dialects/' + localityPath

    if (fs.existsSync(localityDialectsDir)) {
      return console.log(c.bold('\n %s') + ' already exists\n', localityPath)
    }

    // set up dialect files for this tribe/locality
    if (!fs.existsSync(localityDialectsDir)) {
      fs.mkdirsSync(localityDialectsDir)
    }
    // meta data
    var localityMetadataFilePath = localityDialectsDir + '/meta.yml'
    var localityName = locality.capitalize()
    var localityScript = argv.script || util.script[tribe] || 'default'
    var localityLongitude = argv.longitude || 0
    var localityLatitude = argv.latitude || 0
    var localityMetadata = ''
        localityMetadata += 'path: ' + localityPath + '\n'
        localityMetadata += 'name: ' + localityName + '\n'
        localityMetadata += 'script: ' + localityScript + '\n'
        localityMetadata += 'latitude: ' + localityLatitude + '\n'
        localityMetadata += 'longitude: ' + localityLongitude + '\n'
    fs.writeFileSync(localityMetadataFilePath, localityMetadata)

    // initialize based on an existing trbe/locality
    if (argv._.indexOf('from') === 2 && argv._.length === 4) {

      var to = localityPath
      var from = argv._[3]
      if (to === from) {
        return console.log('\n Cannot initialize ' + c.bold('%s') + ' from itself\n', to)
      }

      var fromDialectDir = process.cwd() + '/dialects/' + from

      if (fs.existsSync(fromDialectDir)) {

        var toDialectDir = localityDialectsDir
        fs.copySync(fromDialectDir, toDialectDir)

        var fromLocality = from.split('/')[1].capitalize()
        var toLocality = to.split('/')[1].capitalize()

        var localityYmlFile = toDialectDir + '/meta.yml'
        var localityYmlFileContent = fs.readFileSync(localityYmlFile).toString()
        localityYmlFileContent = localityYmlFileContent.replace(from, to)
        localityYmlFileContent = localityYmlFileContent.replace(fromLocality, toLocality)
        fs.writeFileSync(localityYmlFile, localityYmlFileContent)

        console.log(c.bold('\n %s') + ' initialized from ' + c.bold('%s\n'), to, from)

      } else {
        return console.log(c.bold('\n %s') + c.red(' does not exists\n'), from)
      }

    } else {

      Object.keys(util.concepts).forEach(function (construct) {

        var constructConceptDir = conceptsDir + '/'+ construct

        if (fs.existsSync(constructConceptDir)) {

          // NOTE: supports only one level deep
          // TODO: suppport infitnite depth
          // console.log(constructConceptDir)
          initDialectFiles(constructConceptDir, tribe, locality, construct)

        }

      })

      console.log(c.bold('\n %s') + ' initialized\n', localityPath)

    }

  } else {
    formatError()
  }

}

// pass a starting dir to recreate the dir structure in the locality's dir with the corresponding files
function initDialectFiles(startingDir, tribe, locality, construct, subDir) {

  // return console.log(startingDir)

  // this is where the corresponding dialect files will be generated
  var localityPath = tribe + '/' + locality
  var localityDialectsDir = process.cwd() + '/dialects/' + localityPath

  var files = fs.readdirSync(startingDir)

  files.forEach(function (file) {

    var filePath = startingDir + '/' + file
    var stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      var newStartingDir = startingDir + '/' + file
      return initDialectFiles(newStartingDir, tribe, locality, construct, file)
    }
    else {
      if (util.ignore.indexOf(file) === -1) {
        // create the templates for the dialect files
        var conceptFilelocalityPath = startingDir + '/' + file
        var dialectFilelocalityPath = conceptFilelocalityPath.replace(conceptsDir, dialectsDir + '/' + localityPath)
        return generateDialectFile(conceptFilelocalityPath, dialectFilelocalityPath)
      }
    }

  })

}

function formatError() {
  console.log(c.red('\n Invalid format\n'))
  console.log(' Use the format ' + c.bold('tani init <tribe/locality>'))
  console.log(' Eg: tani init adi/geling\n')
}

function generateDialectFile(conceptFilelocalityPath, dialectFilelocalityPath) {
  // console.log(conceptFilelocalityPath)
  // console.log(dialectFilelocalityPath)
  // return console.log()
  var entry = util.getConceptObject(fs.readFileSync(conceptFilelocalityPath).toString())

  fs.createFileSync(dialectFilelocalityPath)

  var includeString = '# ' + entry.definition + '\n'
  if (entry.note) includeString += '# Note: ' + entry.note + '\n'
  if (entry.example) includeString += '# Eg: ' + entry.example + '\n'
  includeString += '\n'
  includeString += 'Root: \n'
  includeString += 'Example: \n'

  fs.writeFileSync(dialectFilelocalityPath, includeString)

}
