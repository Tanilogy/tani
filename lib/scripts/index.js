var c = require('chalk')

var converters = {

  aldc: require(__dirname + '/aldc'),
  gws: require(__dirname + '/gws'),
  nes: require(__dirname + '/nes'),
  pss: require(__dirname + '/pss'),
  abk: require(__dirname + '/abk')

}

module.exports = {

  convert: function(string, from, to, path) {

    if (from === 'default') return string

    if (!(from in converters)) {
      console.log('\n Specify a script for ' + c.bold(path) + '\n')
      process.exit()
    }

    Object.keys(converters[from].from).forEach(function(letter) {
      var re = RegExp(letter, 'gi');
      string = string.replace(re, converters[from].from[letter])
    })

    return string.toLowerCase().capitalize()
  }

}
