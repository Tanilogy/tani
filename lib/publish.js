var fs = require('fs')
var c = require('chalk')
var apoc = require('apoc')()

module.exports = function () {

  if (fs.existsSync('index.acf')) {
    apoc.query('index.acf').exec().then(function (res) {
      console.log()
      console.log(res)
      console.log()
    }, function (err) {
      console.log()
      console.log(err)
      console.log()
    })
  }
  else {
    console.log()
    console.log(c.red(' index.acf not found'))
    console.log()
  }

}