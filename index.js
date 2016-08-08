#! /usr/bin/env node

var path = require('path')
var lib = require(path.join(__dirname, 'lib'))
var pkg = require(path.join(__dirname, 'package.json'))

var argv = require('minimist')(process.argv.slice(2))
var command = argv._[0]

if (argv.v) {
  return console.log(' ' + pkg.version)
}

switch (command) {

  case 'help':
    lib.help()
    break

  // initialize dir for a location
  case 'init':
    lib.init(argv)
    break

  // reset files to init mode
  case 'reset':
    lib.reset(argv)
    break

  // delete dir
  case 'delete':
    lib.del(argv)
    break

  // compile the dialect files to apoc queries
  case 'compile':
    lib.compile(argv)
    break

  // create empty dialect files from new construct files
  case 'sync':
    lib.sync(argv)
    break

  // translator
  case 'translate':
    lib.translate(argv)
    break

  // publish
  case 'publish':
    lib.publish()
    break

  default:
    console.log(' Command not supported %s', command)
}
