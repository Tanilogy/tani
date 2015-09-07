var fs = require('fs-extra')
var c = require('chalk')
var safeEval = require('safe-eval')
var util = require(__dirname + '/util')

module.exports = function (argv) {

  var path = argv._[1]
  var temp = path.split('/')
  if (temp.length === 2) {

    var tribe = temp[0].toLowerCase()
    var locality = temp[1].toLowerCase()

    // where concept files reside
    var conceptsDir = process.cwd() + '/system/concepts'
    var conceptsDirExists = fs.existsSync(conceptsDir)
    // query files for the tribe
    var tribeDir = process.cwd() + '/system/queries/' + tribe
    var tribeDirIndex = process.cwd() + '/system/queries/' + tribe + '/index.acf'
    // where dialect files will reside
    var localityDialectsDir = process.cwd() + '/dialects/' + path
    // where query files will reside
    var localityQueriesDir = process.cwd() + '/system/queries/' + path
    var localityQueriesDirIndex = process.cwd() + '/system/queries/' + path + '/index.acf'

    if (fs.existsSync(localityDialectsDir)) {
      return console.log(c.bold('\n %s') + ' already exists\n', path)
    }

    // set up tribe file index for this tribe/locality
    if (!fs.existsSync(tribeDir)) {
      fs.mkdirsSync(tribeDir)
      fs.createFileSync(tribeDirIndex)
      fs.appendFileSync(tribeDirIndex, 'var tribe = ' + tribe.capitalize() + '\n\n')
      fs.appendFileSync(tribeDirIndex, 'include ' + locality + '/index.acf\n')
    }
    else {
      fs.appendFileSync(tribeDirIndex, 'include ' + locality + '/index.acf\n')
    }

    // set up query files index for this tribe/locality
    if (!fs.existsSync(localityQueriesDirIndex)) {
      fs.createFileSync(localityQueriesDirIndex)
    }

    // set up dialect files for this tribe/locality
    if (!fs.existsSync(localityDialectsDir)) {
      fs.mkdirsSync(localityDialectsDir)
    }

    // initialize based on an existing trbe/locality
    if (argv._.indexOf('from') === 2 && argv._.length === 4) {

      var to = path
      var from = argv._[3]
      if (to === from) {
        return console.log('\n Cannot initialize ' + c.bold('%s') + ' from itself\n', to)
      }

      if (fs.existsSync(from)) {

        var fromQueriesDir = process.cwd() + '/system/queries/' + from
        var fromDialectDir = process.cwd() + '/dialects/' + from
        var toQueriesDir = localityQueriesDir
        var toDialectDir = localityDialectsDir

        fs.copySync(fromQueriesDir, toQueriesDir)
        fs.copySync(fromDialectDir, toDialectDir)

        console.log(c.bold('\n %s') + ' initialized from ' + c.bold('%s\n'), to, from)

      } else {
        return console.log(c.bold('\n %s') + c.red(' does not exists\n'), from)
      }

    } else {

      // register locality headers
      var localityObject = "var locality = { name: '"+ locality.capitalize() +"', lat: 0, long: 0, script: 'default' }\n\n"
      fs.appendFileSync(localityQueriesDirIndex, localityObject)
      fs.appendFileSync(localityQueriesDirIndex, "CREATE (n:Locality %locality%)\n\n")

      util.constructs.forEach(function (construct) {

        // # query files - these should be compiled from the dialect files
        var constructPath = localityQueriesDir + '/' + construct
        var constructEntries = constructPath + '/entries'
        var constructIndex = constructPath + '/index.acf'

        fs.mkdirsSync(constructPath)
        fs.mkdirsSync(constructEntries)
        fs.createFileSync(constructIndex)
        fs.appendFileSync(localityQueriesDirIndex, 'include ' + construct + '/index.acf\n')

        if (conceptsDirExists) {

          var conceptEntriesDir = conceptsDir + '/'+ construct +'/' + 'entries'
          var files = fs.readdirSync(conceptEntriesDir)

          files.forEach(function (file) {
            // create the templates for the dialect files
            var conceptFilePath = conceptEntriesDir + '/' + file
            var conceptFileContent = fs.readFileSync(conceptFilePath).toString()
            var temp = conceptFileContent.split('{')[1].split('}')[0].trim()
            var entry = safeEval('{ ' + temp + ' }')
            var dialectFilePath = localityDialectsDir + '/' + construct + '/entries/' + file.replace('acf', 'txt')
            generateDialectFile(dialectFilePath, entry)
          })

        }

      })

    }

  } else {
    console.log(c.red('\n Invalid format'))
    console.log(' Use the format ' + c.bold('tani init <tribe/locality>'))
    console.log(' Ex: tani init adi/geling\n')
  }

}

function generateDialectFile(dialectFilePath, entry) {

  fs.createFileSync(dialectFilePath)
  var includeString = '# ' + entry.literal + '\n'
  if (entry.note) includeString += '# ' + entry.note + '\n'
  includeString += '\n'
  includeString += 'Root: \n'
  includeString += 'Example: \n'
  includeString += 'Example: \n'
  fs.writeFileSync(dialectFilePath, includeString)

}