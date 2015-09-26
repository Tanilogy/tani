var c = require('chalk')

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = {

  script: {
    tanw: 'aldc',
    gaalo: 'gws',
    nyishi: 'nes',
    adi: 'abk'
  },

  ignore: [
    '.DS_Store',
    '*-all.txt',
    'notes.txt'
  ],

  constructs: {
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
  }

}
