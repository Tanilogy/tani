String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = {

  constructs: {
    'n': 'noun',
    'nm': 'noun-modifier',
    'v': 'verb',
    'vm': 'verb-modifier'
  }

}
