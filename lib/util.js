var c = require('chalk')
var fs = require('fs-extra')
var isDir = require('is-directory')
var YAML = require('yamljs')

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

var util = module.exports = {

  script: {
    tanw: 'aldc',
    galoo: 'gws',
    nyishi: 'nes',
    adi: 'abk'
  },

  ignore: [
    '.DS_Store',
    '*-all.txt',
    'notes.txt',
    'meta.yml'
  ],

  concepts: {
    'n': 'noun',
    'nm': 'noun modifier',
    'v': 'verb',
    'vm': 'verb modifier',
    'adj': 'adjective',
    'adjm': 'adjective modifier',
    'conj': 'conjunctions',
    'intjn': 'interjection',
    'intrg': 'interrogation',
    'prn': 'pronoun'
  },

  errors: {
    notFound: function (localityPath) {
      console.log('\n '+  c.bold(localityPath) +' not found\n')
    },
    invalidFormat: function (command) {
      console.log(c.red('\n Invalid format\n'))
      console.log(' Use the format ' + c.bold('tani % <tribe/locality>', command))
      console.log(' Ex: tani %s adi/geling\n', command)
    }
  },

  // change the index of a file in a dir
  moveFileIndex: function(targetDir, fromIndex, toIndex) {

    // increment not required
    if (fromIndex == toIndex) return

    // if id is to be at a lower value
    if (fromIndex > toIndex) {

      var currentToName = targetDir + '/' + toIndex + '.txt'
      var tempName = targetDir + '/temp.txt'
      fs.renameSync(currentToName, tempName)

      var indexCounter = +fromIndex
      while (indexCounter > toIndex) {
        var oldName = targetDir + '/' + indexCounter + '.txt'
        var newName = targetDir + '/' + (indexCounter - 1) + '.txt'
        fs.renameSync(oldName, newName)
        indexCounter--
      }

      var indexedName = targetDir + '/' + fromIndex + '.txt'
      fs.renameSync(tempName, indexedName)

    // if id is to be at a higher value
    } else {

      var currentFromName = targetDir + '/' + fromIndex + '.txt'
      var tempName = targetDir + '/temp.txt'
      fs.renameSync(currentFromName, tempName)

      var indexCounter = +fromIndex + 1
      while (indexCounter <= toIndex) {
        var oldName = targetDir + '/' + indexCounter + '.txt'
        var newName = targetDir + '/' + (indexCounter - 1) + '.txt'
        fs.renameSync(oldName, newName)
        indexCounter++
      }

      var indexedName = targetDir + '/' + toIndex + '.txt'
      fs.renameSync(tempName, indexedName)

    }

  },

  // what would be the file id (name) for the next file to be created in the dir?
  getNextFileId: function(targetDir) {

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

  },

  hasDialectEntry: function hasDialectEntry(string) {
    return getEntry(string).length
  },

  getDialectEntry: function checkDialectEntry(string) {
    return getEntry(string)
  },

  getGlobalIdFromFile: function getGlobalIdFromFile(dialectFilePath, localityPath) {
    return dialectFilePath.split(localityPath)[1].replace(/\//g, '').replace('.txt', '').toUpperCase()
  },

  generateDialectFile: function generateDialectFile(conceptFilelocalityPath, dialectFilelocalityPath) {

    var entry = YAML.load(conceptFilelocalityPath)
    fs.createFileSync(dialectFilelocalityPath)

    var includeString = 'Concept: ' + entry.Concept + '\n'
    if (entry.Note) includeString += 'Note: ' + entry.Note + '\n'
    if (entry.Examples) {
      includeString += 'Examples:\n'
      entry.Examples.forEach(function (example) {
        var dialect = Object.keys(example)[0]
        var exampleString = example[dialect]
        includeString += '  - ' + dialect + ': ' + exampleString + '\n'
      })
    }
    includeString += '------------\n'
    includeString += 'Translation: \n'
    includeString += 'Example: \n'

    fs.writeFileSync(dialectFilelocalityPath, includeString)

  },

  updateDialectFile: function updateDialectFile(conceptFilelocalityPath, dialectFilelocalityPath) {

    var entry = YAML.load(conceptFilelocalityPath)
    var dialectFileContent = fs.readFileSync(dialectFilelocalityPath).toString()
    var temp = dialectFileContent.split('------------')
    var conceptYaml = temp[0]
    var dialectEntry = temp[1]
    var dialectYamlObj = YAML.parse(conceptYaml)

    // update
    if (entry.Concept !== dialectYamlObj.Concept
      || (entry.Note && entry.Note !== dialectYamlObj.Note)
      || (entry.Examples && entry.Examples !== dialectYamlObj.Examples)) {

        var includeString = 'Concept: ' + entry.Concept + '\n'
        if (entry.Note) includeString += 'Note: ' + entry.Note + '\n'
        if (entry.Examples) {
          includeString += 'Examples:\n'
          entry.Examples.forEach(function (example) {
            var dialect = Object.keys(example)[0]
            var exampleString = example[dialect]
            includeString += '  - ' + dialect + ': ' + exampleString + '\n'
          })
        }

        includeString += '------------'
        includeString += dialectEntry

        fs.writeFileSync(dialectFilelocalityPath, includeString)
    }

  },

}

function getEntry(string) {
  var temp = string.split('Root:')
  var entry = temp[1].split('\n')[0]
  return entry.trim()
}
