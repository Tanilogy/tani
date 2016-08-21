var fs = require('fs-extra')
var c = require('chalk')
var path = require('path')
var sync = require(__dirname + '/sync.js')
var isDir = require('is-directory')
var conceptsDir = process.cwd() + '/concepts'
var dialectsDir = process.cwd() + '/dialects'

/**

Move a concept file from one dir to another

* fromPath should be path to a concept file
* toPath should be directory where to move the concept file - a new file name will be generated for the concept

*/

module.exports = function (argv) {

  var fromPath = conceptsDir + '/' + argv._[1] + '.txt'
  var toPath = conceptsDir + '/' + argv._[2]

  if (!fs.existsSync(fromPath)) return console.log(c.red('\n Invalid path: %s\n'), fromPath)
  if (!fs.existsSync(toPath)) return console.log(c.red('\n Invalid path: %s\n'), toPath)

  console.log(fromPath, toPath)

}
