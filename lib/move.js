var fs = require('fs-extra')
var c = require('chalk')
var path = require('path')
var isDir = require('is-directory')

var util = require(__dirname + '/util.js')
var sync = require(__dirname + '/sync.js')

var conceptsDir = process.cwd() + '/concepts'
var dialectsDir = process.cwd() + '/dialects'

module.exports = function (argv) {

  // fromPath should be path to a concept file
  // TODO: support moving dirs in future
  var fromPath = conceptsDir + '/' + argv._[1] + '.txt'
  // toDir should be a directory where to move the concept file - a new file name will be generated for the concept
  var temp = argv._[2].split('@')

  if (temp[1] == 0) return console.log(c.red('\n Invalid index\n'))

  var toDir = conceptsDir + '/' + argv._[2]
  var fileName = temp[1]
  if (temp.length) toDir = conceptsDir + '/' + temp[0]

  // console.log(fromPath)
  // console.log(toDir)
  // console.log('----------------')

  if (!fs.existsSync(fromPath)) return console.log(c.red('\n Invalid path: %s\n'), fromPath)
  if (!fs.existsSync(toDir)) return console.log(c.red('\n Invalid path: %s\n'), toDir)

  var newFileNameCandidate = util.getNextFileId(toDir)
  var newFileName
  var toPath

  // move the file in it's existing dir, at a different index
  if (temp.length > 1) {
    util.moveFileIndex(toDir, temp[1], newFileNameCandidate - 1)
  // move file to a new dir
  } else {
    newFileName = newFileNameCandidate + '.txt'
    toPath = toDir + '/' + newFileName

    fs.move(fromPath, toPath, function (err) {
      if (err) console.log(err)
    })

  }

  // console.log(fromPath)
  // console.log(toPath)
  // console.log('+++++++++++++++++++++')

}
