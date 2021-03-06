'use strict'

var fs = require('fs-extra')
var path = require('path')
var c = require('chalk')
var safeEval = require('safe-eval')
var YAML = require('yamljs')
var isDir = require('is-directory')
var scriptConverter =require(__dirname + '/../scripts')
var compileConcepts = require(__dirname + '/compile-concepts')
var util = require(__dirname + '/util')

module.exports = function (argv) {

  if (argv.all) {

    var dialectsDir = process.cwd() + '/dialects'
    var queriesDir = process.cwd() + '/queries'

    if (!fs.existsSync(dialectsDir)) {
      return console.log('\n Nothing to compile\n')
    }

    if (fs.existsSync(queriesDir)) {
      fs.removeSync(queriesDir)
    }

    compileConcepts()
    initQueryIndex()

    var tribes = fs.readdirSync(dialectsDir)
    tribes.forEach(function (tribe) {
      var tribeDialectsDir = dialectsDir + '/' + tribe
      var localities = fs.readdirSync(tribeDialectsDir)
      localities.forEach(function (locality) {
        compile(tribe, locality)
      })
    })

  } else if (argv.concepts) {
    compileConcepts()
  } else if (argv._.length === 2) {

    var temp = argv._[1].split('/')

    if (temp.length === 2) {
      var tribe = temp[0].toLowerCase()
      var locality = temp[1].toLowerCase()

      initQueryIndex()
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

  registerTribe(tribe, locality)
  registerLocality(tribe, locality)
  compileQueries(tribe, locality)

}

function compileQueries(tribe, locality) {

  var localityPath = tribe + '/' + locality
  var localityDialectsDir = process.cwd() + '/dialects/' + localityPath

  // where query files will reside
  var localityQueriesDir = process.cwd() + '/queries/' + localityPath
  var localityQueriesDirIndex = process.cwd() + '/queries/' + localityPath + '/index.acf'

  // create the queries dir
  fs.mkdirpSync(localityQueriesDir)

  // compile the concept queries from the dialect file
  var localityMetadataFile = localityDialectsDir + '/meta.yml'
  var localityMetadata = YAML.load(localityMetadataFile)
  var script = localityMetadata.script

  Object.keys(util.concepts).forEach(function (concept) {

    // check if corresponding dialects dir exists
    var dialectsConstructDir = localityDialectsDir + '/' + concept
    if (fs.existsSync(dialectsConstructDir)) {
      compileEntries(dialectsConstructDir, localityPath, concept, script)
    }

  })

}

function compileEntries(startingDir, localityPath, concept, script) {

  //return console.log(startingDir)

  var localityQueriesDirIndex = process.cwd() + '/queries/' + localityPath + '/index.acf'
  var localityQueriesDir = process.cwd() + '/queries/' + localityPath

  var files = fs.readdirSync(startingDir)
  files.forEach(function (file) {

    if (util.ignore.indexOf(file) === -1) {

      var currentFilePath = startingDir + '/' + file

      if (isDir.sync(currentFilePath)) {
        var newStartingDir = startingDir + '/' + file
        //console.log(' --> ', newStartingDir)
        return compileEntries(newStartingDir, localityPath, concept, script)
      }
      else {
        //console.log(currentFilePath)
        var dialectFilePath = startingDir + '/' + file
        //console.log(dialectFilePath)
        var dialectEntry = util.getDialectEntry(fs.readFileSync(dialectFilePath).toString())

        // dialect files entry?
        if (dialectEntry.Translink) {

          var file = path.basename(dialectFilePath)

          var conceptsIndexFile = localityQueriesDir + '/' + concept + '/index.acf'
          if (!fs.existsSync(conceptsIndexFile)) {
            fs.createFileSync(conceptsIndexFile)
          }

          var includeConceptString = 'include ' + concept + '\n'
          var localityQueriesDirIndexContent = fs.readFileSync(localityQueriesDirIndex)
          if (localityQueriesDirIndexContent.indexOf(includeConceptString) < 0) {
            fs.appendFileSync(localityQueriesDirIndex, includeConceptString)
          }

          var globalID = util.getGlobalIdFromFile(dialectFilePath, localityPath)
          var queryFilePath = localityQueriesDir + '/' + concept + '/' + globalID.toLowerCase() + '.acf'
          //console.log(queryFilePath)
          fs.createFileSync(queryFilePath)

          var parsed = parseDialectFile(dialectFilePath, globalID, concept, script, localityPath, dialectEntry)
          if (parsed) {
            fs.writeFileSync(queryFilePath, parsed)
            var includeEntriesString = 'include ' + globalID.toLowerCase() + '.acf\n'
            var conceptsIndexFileContent = fs.readFileSync(conceptsIndexFile)
            if (conceptsIndexFileContent.indexOf(includeEntriesString) < 0) {
              fs.appendFileSync(conceptsIndexFile, includeEntriesString)
            }
          }

        }

      }

    }

  })

}

function initQueryIndex() {
  var queriesIndexFile = process.cwd() + '/queries/index.acf'
  if (!fs.existsSync(queriesIndexFile)) {
    fs.createFileSync(queriesIndexFile)
  }
}

function compileConceptsForDialect(currentConceptsDir, conceptType, IDPrefix, subDir) {

  if (!fs.existsSync(currentConceptsDir)) {
    return
  }

  var files = fs.readdirSync(currentConceptsDir)
  files.forEach(function (file) {

    if (util.ignore.indexOf(file) === -1) {

      var currentFilePath = currentConceptsDir + '/' + file
      var stat = fs.statSync(currentFilePath);

      if (stat.isDirectory()) {
        var newIDPrefix = IDPrefix ? IDPrefix + file : file
        return compileConceptsForDialect(currentFilePath, conceptType, newIDPrefix, file)
      }
      else {

        var globalID = conceptType.toUpperCase()
        if (IDPrefix) {
          globalID += IDPrefix.toUpperCase()
        }
        globalID += file.replace('.txt', '').toUpperCase()
        var conceptsIndexFile = process.cwd() + '/queries/concepts.acf'
        var concept = util.getConceptObject(fs.readFileSync(currentFilePath).toString())
        var conceptEntry = "global "+ globalID + " = { definition: '" + concept.definition + "'"
            if (concept.note) {
              conceptEntry += ", note: '" + concept.note + "'"
            }
            conceptEntry += " }\n"
            conceptEntry += "CREATE ("+ globalID +":Concept {"+ globalID +"})\n"
        fs.appendFileSync(conceptsIndexFile, conceptEntry)

      }

    }

  })

}

var tribeIndexCreated = false
var indexedTribes = []

function registerTribe(tribe, locality) {

  if (indexedTribes.indexOf(tribe) > -1) {
    return
  }

  var queriesIndexFile = process.cwd() + '/queries/index.acf'

  if (!tribeIndexCreated) {
    fs.createFileSync(queriesIndexFile)
    tribeIndexCreated = true
  }

  var tribeDirIndex = process.cwd() + '/queries/' + tribe + '/index.acf'

  // set up tribe file index for this tribe/locality
  if (!fs.existsSync(tribeDirIndex)) {
    fs.createFileSync(tribeDirIndex)
    fs.appendFileSync(tribeDirIndex, 'var tribe = ' + tribe.capitalize() + '\n\n')
    fs.appendFileSync(queriesIndexFile, 'include ' + tribe + '\n')

    indexedTribes.push(tribe)
  }
}

function registerLocality(tribe, locality) {

  var localityPath = tribe + '/' + locality
  var localityQueriesDirIndex = process.cwd() + '/queries/' + localityPath + '/index.acf'

  // create the locality index file
  if (!fs.existsSync(localityQueriesDirIndex)) {
    fs.createFileSync(localityQueriesDirIndex)

    var localityDialectsDir = process.cwd() + '/dialects/' + localityPath
    var localityMetadataFile = localityDialectsDir + '/meta.yml'
    var localityMetadata = YAML.load(localityMetadataFile)

    var localityString = "var locality = { name: '" + localityMetadata.name +"', latitude: " + localityMetadata.latitude  +", longitude: " + localityMetadata.longitude + ", script: '"+ localityMetadata.script + "' }\n"
        localityString += "CREATE (n:Locality:" + localityPath.split('/')[0].capitalize() + " {locality})\n\n"
    fs.writeFileSync(localityQueriesDirIndex, localityString)
  }

  // register to the tribe index file
  var tribeDirIndex = process.cwd() + '/queries/' + tribe + '/index.acf'
  // register the locality
  var tribeDirIndexContent = fs.readFileSync(tribeDirIndex).toString()
  var localityIncludeString = 'include ' + locality + '\n'
  if (tribeDirIndexContent.indexOf(localityIncludeString) < 0) {
    fs.appendFileSync(tribeDirIndex, localityIncludeString)
  }
}

function parseDialectFile(dialectFilePath, globalID, concept, script, localityPath, dialectEntry) {

  var content

  // compile creation
  var dialectFileContent = fs.readFileSync(dialectFilePath).toString()
  var root = dialectFileContent.split('Concept:')[1].split('\n')[0].trim()

  // make entry only if the root is defined
  if (root) {

    var templatesDir = path.join(__dirname, '..', 'templates')
    var createTemplateFile = templatesDir + '/query-dialect.txt'
    var derivateTemplateFile = templatesDir + '/derivate.txt'
    var exampleTemplateFile = templatesDir + '/example.txt'

    content = fs.readFileSync(createTemplateFile).toString()

    content = content.replace('#ROOT#', scriptConverter.convert(root, script, 'tanilogy', localityPath))
    content = content.replace('#GLOBALID#', globalID)
    content = content.replace('#CONCEPT-TYPE#', concept)
    content = content.replace('#TRIBE#', localityPath.split('/')[0].capitalize())
    content = content.replace('#ENTRY#', dialectEntry.Translink.toLowerCase())

    // derivate

    // example(s)

  }

  return content

}
