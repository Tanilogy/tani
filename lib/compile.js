var fs = require('fs-extra')
var path = require('path')
var c = require('chalk')
var safeEval = require('safe-eval')
var YAML = require('yamljs')
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
        compile(tribe, locality)
      })
    })

  } else if (argv._.length === 2) {

    var temp = argv._[1].split('/')

    if (temp.length === 2) {
      var tribe = temp[0].toLowerCase()
      var locality = temp[1].toLowerCase()
      compile(tribe, locality)
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

function compile(tribe, locality) {

  var localityPath = tribe + '/' + locality
  var localityDialectsDir = process.cwd() + '/dialects/' + localityPath

  if (!fs.existsSync(localityDialectsDir)) {
    return console.log(c.bold('\n %s') + ' does not exist\n', localityPath)
  }

  compileTribe(tribe, locality)
  compileLocality(localityPath)
  compileConcepts(localityPath, localityDialectsDir)

}

function compileConcepts(localityPath, localityDialectsDir) {

  // where query files will reside
  var localityQueriesDir = process.cwd() + '/queries/' + localityPath
  var localityQueriesDirIndex = process.cwd() + '/queries/' + localityPath + '/index.acf'

  // create the queries dir
  fs.mkdirpSync(localityQueriesDir, localityDialectsDir)

  // compile the concept queries from the dialect file
  var localityMetadataFile = localityDialectsDir + '/meta.yml'
  var localityMetadata = YAML.load(localityMetadataFile)
  var script = localityMetadata.script

  Object.keys(util.constructs).forEach(function (construct) {

    // check if corresponding dialects dir exists
    var dialectsConstructDir = localityDialectsDir + '/' + construct
    if (fs.existsSync(dialectsConstructDir)) {

      function compileEntries(dialectsConstructDir, subDir) {

        var files = fs.readdirSync(dialectsConstructDir)
        files.forEach(function (file) {

         if (util.ignore.indexOf(file) === -1) {

          var currentFilePath = dialectsConstructDir + '/' + file
          var stat = fs.statSync(currentFilePath);

          if (stat.isDirectory()) {
            return compileEntries(currentFilePath, file)
          }
          else {

            var dialectFilePath = localityDialectsDir + '/' + construct + '/' + (subDir ? subDir + '/' : '') + file

            if (util.checkDialectEntry(fs.readFileSync(dialectFilePath).toString())) {
              var file = path.basename(dialectFilePath)
              //console.log(file)
              var constructsIndexFile = localityQueriesDir + '/' + construct + '/index.acf'
              if (fs.existsSync(constructsIndexFile)) fs.writeFileSync(constructsIndexFile, '')

              var globalID = file.replace('.txt', '').toUpperCase()
              var queryFilePath = localityQueriesDir + '/' + construct + '/entries/' + file.replace('txt', 'acf')
              fs.createFileSync(queryFilePath)
              //console.log(localityQueriesDir)
              var parsed = parseDialectFile(dialectFilePath, globalID, construct, script, localityPath)
              if (parsed) {
                fs.writeFileSync(queryFilePath, parsed)
                var includeString = 'include entries/' + file.replace('txt', 'acf') + '\n'
                fs.appendFileSync(constructsIndexFile, includeString)
              }
            }

          }

         }

        })

      }

      compileEntries(dialectsConstructDir)

    }

  })

}

function compileTribe(tribe, locality) {
  // query files for the tribe
  var tribeDir = process.cwd() + '/queries/' + tribe
  var tribeDirIndex = process.cwd() + '/queries/' + tribe + '/index.acf'

  // set up tribe file index for this tribe/locality
  if (!fs.existsSync(tribeDirIndex)) {
    fs.mkdirsSync(tribeDir)
    fs.createFileSync(tribeDirIndex)
    fs.appendFileSync(tribeDirIndex, 'var tribe = ' + tribe.capitalize() + '\n\n')
    fs.appendFileSync(tribeDirIndex, 'include ' + locality + '/index.acf\n')
  }
  else {
    var tribeDirIndexContent = fs.readFileSync(tribeDirIndex).toString()
    var localityIncludeString = 'include ' + locality + '/index.acf\n'
    if (tribeDirIndexContent.indexOf(localityIncludeString) < 0) {
      fs.appendFileSync(tribeDirIndex, localityIncludeString)
    }
  }

}

function compileLocality(localityPath) {

  // where query files will reside
  var localityQueriesDir = process.cwd() + '/queries/' + localityPath
  var localityQueriesDirIndex = process.cwd() + '/queries/' + localityPath + '/index.acf'

  if (!fs.existsSync(localityQueriesDirIndex)) {
    fs.createFileSync(localityQueriesDirIndex)
  }

}

function parseDialectFile(dialectFilePath, globalID, construct, script, localityPath) {

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

    content = content.replace('#ROOT#', scriptConverter.convert(root, script, 'tanilogy', localityPath))
    content = content.replace('#TYPE#', construct)
    content = content.replace('#GLOBALID#', globalID)
    content = content.replace('#CONSTRUCT#', construct)

    // derivate

    // example(s)

  }

  return content

}
