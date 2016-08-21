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

  // add a concept
  case 'add':
    lib.add(argv)
    break

  // delete a concept
  case 'delete':
    lib.delete(argv)
    break

  // initialize a dialect
  case 'init':
    lib.init(argv)
    break

  // delete a dialect
  case 'uninit':
    lib.uninit(argv)
    break

  // compile the dialect files to apoc queries
  case 'compile':
    lib.compile(argv)
    break

  // incorporate updates in concepts to dialects
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

  // publish
  case 'unpublish':
    lib.unpublish()
    break

  // publish
  case 'move':
    lib.move(argv)
    break

  default:
    console.log(' Command not supported %s', command)
}
