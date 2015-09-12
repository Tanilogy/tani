var fs = require('fs-extra')
var c = require('chalk')
var safeEval = require('safe-eval')
var scriptConverter =require(__dirname + '/scripts')
var util = require(__dirname + '/util')

module.exports = function (argv) {

  if (argv.all) {

    var dialectsDir = process.cwd() + '/dialects'

    if (!fs.existsSync(dialectsDir)) {
      return console.log('\n Nothing to compile\n')
    }

    var tribes = fs.readdirSync(dialectsDir)
    tribes.forEach(function (tribe) {
      var tribeDialectsDir = dialectsDir + '/' + tribe
      var localities = fs.readdirSync(tribeDialectsDir)
      localities.forEach(function (locality) {
        var path = tribe + '/' + locality
        compile(tribe, locality, path)
      })
    })

  } else if (argv._.length === 2) {

    var path = argv._[1]
    var temp = path.split('/')

    if (temp.length === 2) {
      var tribe = temp[0].toLowerCase()
      var locality = temp[1].toLowerCase()
      compile(tribe, locality, path)
    }
    else {
      errorMessage()
    }

  } else {
    errorMessage()
  }

}

function errorMessage() {
  console.log(c.red('\n Invalid format\n'))
  console.log(' Use the format ' + c.bold('tani compile <tribe/locality>'))
  console.log(' Ex: tani compile adi/geling\n')
}

function compile(tribe, locality, path) {

  var localityDialectsDir = process.cwd() + '/dialects/' + path

  // query files for the tribe
  var tribeDir = process.cwd() + '/queries/' + tribe
  var tribeDirIndex = process.cwd() + '/queries/' + tribe + '/index.acf'
  // where dialect files will reside
  
  // where query files will reside
  var localityQueriesDir = process.cwd() + '/queries/' + path
  var localityQueriesDirIndex = process.cwd() + '/queries/' + path + '/index.acf'
  var localityQueriesDirIndexContent = fs.readFileSync(localityQueriesDirIndex).toString()
  var script = safeEval(localityQueriesDirIndexContent.split('\n')[0].split('=')[1].trim()).script

  if (!fs.existsSync(localityDialectsDir)) {
    return console.log(c.bold('\n %s') + ' does not exist\n', path)
  }

  var files = fs.readdirSync(localityDialectsDir)
  files.forEach(function (construct) {

    var dialectDir = localityDialectsDir + '/' + construct + '/'
    var files = fs.readdirSync(dialectDir)

    var constructsIndexFile = localityQueriesDir + '/' + construct + '/index.acf'
    if (fs.existsSync(constructsIndexFile)) fs.writeFileSync(constructsIndexFile, '')

    files.forEach(function (file) {
      var globalID = file.replace('.txt', '').toUpperCase()
      var queryFilePath = localityQueriesDir + '/' + construct + '/entries/' + file.replace('txt', 'acf')
      var dialectFilePath = dialectDir + file
      var parsed = parseDialectFile(dialectFilePath, globalID, construct, script, path)
      if (parsed) {
        fs.writeFileSync(queryFilePath, parsed)
        var includeString = 'include entries/' + file.replace('txt', 'acf') + '\n'
        fs.appendFileSync(constructsIndexFile, includeString)
      }
    })

  })

}

function parseDialectFile(dialectFilePath, globalID, construct, script, path) {

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

    content = content.replace('#ROOT#', scriptConverter.convert(root, script, 'tanilogy', path))
    content = content.replace('#TYPE#', construct)
    content = content.replace('#GLOBALID#', globalID)
    content = content.replace('#CONSTRUCT#', construct)

    // derivate

    // example(s)

  }

  return content

}
