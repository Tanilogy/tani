var pkg = require(__dirname + '/../package.json')
var c = require('chalk')

module.exports = function () {
  console.log()
  console.log(c.bold(' %s %s'), pkg.name, pkg.version)
  console.log()
  console.log(c.yellow(' tani init <tribe/locality>') + ' to initialize a set')
  console.log(c.yellow(' tani init <tribe/locality> from <tribe/locality>') + ' to initialize a set from an existing set')
  console.log(c.yellow(' tani delete <tribe/locality>') + ' to delete a set')
  console.log(c.yellow(' tani update <tribe/locality>') + ' to update a set files derived from constructs')
  console.log()
}
