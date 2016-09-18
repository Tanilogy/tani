var c = require('chalk')
var fs = require('fs-extra')
var isDir = require('is-directory')
var YAML = require('yamljs')
var conceptsDir = process.cwd() + '/concepts'
var dialectsDir = process.cwd() + '/dialects'

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

var util = module.exports = {

  script: {
    apatani: 'aldc',
    galo: 'gws',
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

  // get the autoincremented next id for a file in a dir
  getNextFileId: function getNextFileId(targetDir) {

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

  // change the index of a file in a dir
  moveFileIndex: function(targetDir, fromIndex, toIndex) {

    fromIndex = +fromIndex
    toIndex = +toIndex

    // increment not required
    if (fromIndex == toIndex) return

    var fileToBeMoved = targetDir + '/' + fromIndex + '.txt'
    var tempName = fileToBeMoved + '_'
    fs.renameSync(fileToBeMoved, tempName)
    prepareDialectSync(fileToBeMoved)

    var destName = targetDir + '/' + toIndex + '.txt'

    if (fromIndex > toIndex) {

      var counter = fromIndex - 1
      while (counter >= toIndex) {
        var oldName = targetDir + '/' + counter + '.txt'
        var newName = targetDir + '/' + (counter + 1) + '.txt'
        fs.renameSync(oldName, newName)
        syncDialectFile(oldName, newName)
        counter--
      }

    } else {

      var counter = fromIndex + 1
      while (counter <= toIndex) {
        var oldName = targetDir + '/' + counter + '.txt'
        var newName = targetDir + '/' + (counter - 1) + '.txt'
        fs.renameSync(oldName, newName)
        syncDialectFile(oldName, newName)
        counter++
      }

    }

    fs.renameSync(tempName, destName)
    completeDialectSync(fileToBeMoved, destName)

    function prepareDialectSync(fileToBeMoved) {

      if (!fs.existsSync(dialectsDir)) return

      fs.readdirSync(dialectsDir).forEach(function (tribe) {
        var tribeDirPath = dialectsDir + '/' + tribe
        fs.readdirSync(tribeDirPath).forEach(function (locality) {
          var localitySegment = '/dialects/' + tribe + '/' + locality
          var dialectFilePath = fileToBeMoved.replace('concepts', localitySegment)
          var tempDialectFilePath = dialectFilePath + '_'
          fs.renameSync(dialectFilePath, tempDialectFilePath)
        })
      })

    }

    function syncDialectFile(oldName, newName) {

      if (!fs.existsSync(dialectsDir)) return

      fs.readdirSync(dialectsDir).forEach(function (tribe) {
        var tribeDirPath = dialectsDir + '/' + tribe
        fs.readdirSync(tribeDirPath).forEach(function (locality) {
          var localitySegment = '/dialects/' + tribe + '/' + locality
          var oldDialectName = oldName.replace('concepts', localitySegment)
          var newDialectName = newName.replace('concepts', localitySegment)
          fs.renameSync(oldDialectName, newDialectName)
        })
      })

    }

    function completeDialectSync(fileToBeMoved, destName) {

      if (!fs.existsSync(dialectsDir)) return

      fs.readdirSync(dialectsDir).forEach(function (tribe) {
        var tribeDirPath = dialectsDir + '/' + tribe
        fs.readdirSync(tribeDirPath).forEach(function (locality) {
          var localitySegment = '/dialects/' + tribe + '/' + locality
          var dialectFilePath = fileToBeMoved.replace('concepts', localitySegment)
          var tempDialectFilePath = dialectFilePath + '_'
          var destDialectName = destName.replace('concepts', localitySegment)
          fs.renameSync(tempDialectFilePath, destDialectName)
        })
      })

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
    return Boolean(getEntry(string))
  },

  // get the details of the entry made for a concept, for a dialect
  getDialectEntry: function getDialectEntry(string) {
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
    includeString += 'Translink: \n'
    includeString += 'Intonation: \n'
    includeString += 'Etymology: \n'
    includeString += 'Note: \n'
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
  var dialectYaml = string.split('---').splice(-1)[0]
  var entry = YAML.parse(dialectYaml)
  return entry
}
