var c = require('chalk')

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = {

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
    'intrg': 'interrogation'
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

  // convert a concept string to a concept object
  getConceptObject: function getConceptObject(string) {

    var o = {}
    var temp

    temp = string.split('\n')
    o.definition = temp[0].trim()

    temp = string.split('Note:')
    if (temp.length > 1) {
      o.note = temp[1].split('\n')[0].trim()
    }

    temp = string.split('Eg:')
    if (temp.length > 1) {
      o.example = temp[1].split('\n')[0].trim()
    }

    return o

  },

  hasDialectEntry: function hasDialectEntry(string) {
    return getEntry(string).length
  },

  getDialectEntry: function checkDialectEntry(string) {
    return getEntry(string)
  },

  getGlobalIdFromFile: function getGlobalIdFromFile(dialectFilePath, localityPath) {
    return dialectFilePath.split(localityPath)[1].replace(/\//g, '').replace('.txt', '').toUpperCase()
  }

}

function getEntry(string) {
  var temp = string.split('Root:')
  var entry = temp[1].split('\n')[0]
  return entry.trim()
}

