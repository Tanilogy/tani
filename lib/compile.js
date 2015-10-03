'use strict'

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
    var queriesDir = process.cwd() + '/queries'

    if (!fs.existsSync(dialectsDir)) {
      return console.log('\n Nothing to compile\n')
    }

    if (fs.existsSync(queriesDir)) {
      fs.removeSync(queriesDir)
    }

    initQueryIndex()
    initCompileConcepts()

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

      initQueryIndex()
      initCompileConcepts()

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

var conceptDialectEntry = []

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

      if (conceptDialectEntry.indexOf(concept) > -1) {
        var localityQueriesDirIndex = process.cwd() + '/queries/' + localityPath + '/index.acf'
        fs.appendFileSync(localityQueriesDirIndex, 'include ' + concept + '/index.acf\n')
      }

    }

  })

}

var registeredConcepts = {}

function compileEntries(startingDir, localityPath, concept, script) {

  // return console.log(startingDir)

  var localityQueriesDirIndex = process.cwd() + '/queries/' + localityPath + '/index.acf'
  var localityQueriesDir = process.cwd() + '/queries/' + localityPath

  var files = fs.readdirSync(startingDir)
  files.forEach(function (file) {

    if (util.ignore.indexOf(file) === -1) {

      var currentFilePath = startingDir + '/' + file
      var stat = fs.statSync(currentFilePath);

      if (stat.isDirectory()) {
        var newStartingDir = startingDir + '/' + file
        return compileEntries(newStartingDir, localityPath, concept, script)
      }
      else {
        // console.log(currentFilePath)
        var dialectFilePath = startingDir + '/' + file
        var dialectEntry = util.getDialectEntry(fs.readFileSync(dialectFilePath).toString())
        // dialect files entry?
        if (dialectEntry.length) {

          var file = path.basename(dialectFilePath)

          var conceptsIndexFile = localityQueriesDir + '/' + concept + '/index.acf'
          if (!fs.existsSync(conceptsIndexFile)) {
            fs.createFileSync(conceptsIndexFile)
          }

          if (!(localityPath in registeredConcepts)) {
            registeredConcepts[localityPath] = []
          }

          if (registeredConcepts[localityPath].indexOf(concept) < 0) {
            fs.appendFileSync(localityQueriesDirIndex, 'include ' + concept + '/index.acf\n')
            registeredConcepts[localityPath].push(concept)
          }

          var globalID = util.getGlobalIdFromFile(dialectFilePath, localityPath)
          var queryFilePath = localityQueriesDir + '/' + concept + '/entries/' + globalID.toLowerCase() + '.acf'
          fs.createFileSync(queryFilePath)

          var parsed = parseDialectFile(dialectFilePath, globalID, concept, script, localityPath)
          if (parsed) {
            fs.writeFileSync(queryFilePath, parsed)
            var includeString = 'include entries/' + globalID.toLowerCase() + '.acf\n'
            fs.appendFileSync(conceptsIndexFile, includeString)
          }

        }

      }

    }

  })

}

function initQueryIndex() {
  var queriesIndexFile = process.cwd() + '/queries/index.acf'
  fs.createFileSync(queriesIndexFile)
}

function initCompileConcepts() {

  var conceptsIndexFile = process.cwd() + '/queries/concepts.acf'
  fs.createFileSync(conceptsIndexFile)

  Object.keys(util.concepts).forEach(function (conceptType) {
    var currentConceptsDir = process.cwd() + '/concepts/' + conceptType
    compileConcepts(currentConceptsDir, conceptType)
  })

  // add to the queries index file
  var queriesIndexFile = process.cwd() + '/queries/index.acf'
  fs.appendFileSync(queriesIndexFile, 'include concepts.acf\n')

}

function compileConcepts(currentConceptsDir, conceptType, IDPrefix, subDir) {

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
        return compileConcepts(currentFilePath, conceptType, newIDPrefix, file)
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
            conceptEntry += "CREATE ("+ globalID +":Concept %"+ globalID +"%)\n"
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
  fs.createFileSync(tribeDirIndex)
  fs.appendFileSync(tribeDirIndex, 'var tribe = ' + tribe.capitalize() + '\n\n')
  fs.appendFileSync(queriesIndexFile, 'include ' + tribe + '/index.acf\n')

  indexedTribes.push(tribe)

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
        localityString += "CREATE (n:Locality:" + localityPath.split('/')[0].capitalize() + " %locality%)\n\n"
    fs.writeFileSync(localityQueriesDirIndex, localityString)
  }

  // register to the tribe index file
  var tribeDirIndex = process.cwd() + '/queries/' + tribe + '/index.acf'
  // register the locality
  var tribeDirIndexContent = fs.readFileSync(tribeDirIndex).toString()
  var localityIncludeString = 'include ' + locality + '/index.acf\n'
  fs.appendFileSync(tribeDirIndex, localityIncludeString)

}

function parseDialectFile(dialectFilePath, globalID, concept, script, localityPath) {

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
    content = content.replace('#GLOBALID#', globalID)
    content = content.replace('#CONCEPT#', concept)
    content = content.replace('#TRIBE#', localityPath.split('/')[0].capitalize())

    // derivate

    // example(s)

  }

  return content

}
