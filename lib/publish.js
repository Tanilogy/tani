var fs = require('fs')
var c = require('chalk')
var Apoc = require('apoc')

module.exports = function () {

  var apoc = new Apoc()

  if (fs.existsSync('index.acf')) {
    var q = apoc.query('index.acf')
    q.exec().then(function (res) {
      console.log()
      console.log(res)
      console.log()
    }, function (fail) {
      console.log()
      console.log(fail)
      console.log()
    })
  }
  else {
    console.log()
    console.log(c.red(' index.acf not found'))
    console.log()
  }

}
