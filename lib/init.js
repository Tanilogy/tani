var fs = require('fs-extra')
var c = require('chalk')
var safeEval = require('safe-eval')
var path = require('path')
var util = require(__dirname + '/util')
var generate = require(__dirname + '/generate')

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
    var conceptsDir = process.cwd() + '/concepts'
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

        console.log(c.bold('\n %s') + ' initialized from ' + c.bold('%s\n'), to, from)

      } else {
        return console.log(c.bold('\n %s') + c.red(' does not exists\n'), from)
      }

    } else {

      Object.keys(util.constructs).forEach(function (construct) {

        var constructConceptDir = conceptsDir + '/'+ construct

        if (fs.existsSync(constructConceptDir)) {

          // var conceptEntriesDir = conceptsDir + '/'+ construct
          // var files = fs.readdirSync(conceptEntriesDir)

          // files.forEach(function (file) {
          //   // create the templates for the dialect files
          //   var conceptFilelocalityPath = conceptEntriesDir + '/' + file
          //   var conceptFileContent = fs.readFileSync(conceptFilelocalityPath).toString()
          //   var temp = conceptFileContent.split('{')[1].split('}')[0].trim()
          //   var entry = safeEval('{ ' + temp + ' }')
          //   var dialectFilelocalityPath = localityDialectsDir + '/' + construct + '/' + file.replace('acf', 'txt')
          //   generateDialectFile(dialectFilelocalityPath, entry)
          // })

      console.log('init %s', constructConceptDir)

        }

      })

      // console.log(c.bold('\n %s') + ' initialized\n', localityPath)

    }

  } else {
    formatError()
  }

}

function formatError() {
  console.log(c.red('\n Invalid format\n'))
  console.log(' Use the format ' + c.bold('tani init <tribe/locality>'))
  console.log(' Eg: tani init adi/geling\n')
}

function generateDialectFile(dialectFilelocalityPath, entry) {

  fs.createFileSync(dialectFilelocalityPath)
  var includeString = '# ' + entry.literal + '\n'
  if (entry.note) includeString += '# Note: ' + entry.note + '\n'
  if (entry.example) includeString += '# Eg: ' + entry.example + '\n'
  includeString += '\n'
  includeString += 'Root: \n'
  includeString += 'Example: \n'
  fs.writeFileSync(dialectFilelocalityPath, includeString)

}
