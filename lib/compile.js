var fs = require('fs-extra')
var c = require('chalk')
var util = require(__dirname + '/util')

module.exports = function (argv) {

  var path = argv._[1]
  var temp = path.split('/')
  if (temp.length === 2) {

    var tribe = temp[0].toLowerCase()
    var locality = temp[1].toLowerCase()

    // query files for the tribe
    var tribeDir = process.cwd() + '/system/queries/' + tribe
    var tribeDirIndex = process.cwd() + '/system/queries/' + tribe + '/index.acf'
    // where dialect files will reside
    var localityDialectsDir = process.cwd() + '/dialects/' + path
    // where query files will reside
    var localityQueriesDir = process.cwd() + '/system/queries/' + path
    var localityQueriesDirIndex = process.cwd() + '/system/queries/' + path + '/index.acf'

    if (!fs.existsSync(localityDialectsDir)) {
      return console.log(c.bold('\n %s') + ' does not exist\n', path)
    }

    var files = fs.readdirSync(localityDialectsDir)
    files.forEach(function (construct) {

      var dialectDir = localityDialectsDir + '/' + construct + '/'
      var files = fs.readdirSync(dialectDir)

      files.forEach(function (file) {
        var globalID = construct.toUpperCase() + file.replace('.txt', '')
        var queryFilePath = localityQueriesDir + '/' + construct + '/entries/' + file.replace('txt', 'acf')
        var dialectFilePath = dialectDir + file
        var parsed = parseDialectFile(dialectFilePath, globalID, util.constructs[construct])
        if (parsed) {
          fs.writeFileSync(queryFilePath, parsed)
          var constructsIndexFile = localityQueriesDir + '/' + construct + '/index.acf'
          var includeString = 'include entries/' + file.replace('txt', 'acf') + '\n'
          fs.writeFileSync(constructsIndexFile, includeString)
        }
      })

    })

  } else {
    console.log(c.red('\n Invalid format'))
    console.log(' Use the format ' + c.bold('tani compile <tribe/locality>'))
    console.log(' Ex: tani compile adi/geling\n')
  }

}

function parseDialectFile(dialectFilePath, globalID, construct) {

  var content

  // compile creation
  var dialectFileContent = fs.readFileSync(dialectFilePath).toString()
  var root = dialectFileContent.split('Root:')[1].split('\n')[0].trim()

  // make entry only if the root is defined
  if (root) {

    var createTemplateFile = __dirname + '/templates/create.txt'
    var derivateTemplateFile = __dirname + '/templates/derivate.txt'
    var exampleTemplateFile = __dirname + '/templates/example.txt'

    content = fs.readFileSync(createTemplateFile).toString()

    content = content.replace('#ROOT#', root)
    content = content.replace('#GLOBALID#', globalID)
    content = content.replace('#CONSTRUCT#', construct)

    // derivate

    // example(s)

  }

  return content

}
