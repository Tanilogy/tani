String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = {

  ignore: [
    '.DS_Store',
    'n-all.txt',
    'nm-all.txt',
    'v-all.txt',
    'vm-all.txt',
    'adj-all.txt',
    'adjm-all.txt'
  ],

  constructs: {
    'n': 'noun',
    'nm': 'noun-modifier',
    'v': 'verb',
    'vm': 'verb-modifier'
  }

}
