var fs = require('fs-extra')
var c = require('chalk')
var util = require(__dirname + '/util')
var isDir = require('is-directory')
var conceptsDir = process.cwd() + '/concepts'
var dialectsDir = process.cwd() + '/dialects'

module.exports = function (argv) {

  if (argv._.length === 2 && argv.type) {

    var searchString = argv._[1].toLowerCase()

    var targetDir = conceptsDir + '/' + argv.type
    if (!fs.existsSync(targetDir)) return console.log('\n Concepts not found\n')

    function searchConcept(candidateFile) {

      if (isDir.sync(candidateFile)) {
        var currentDir = candidateFile
        var files = fs.readdirSync(currentDir)
        files.forEach(function (file) {

          // if this file is not to be ignored
          if (util.ignore.indexOf(file) === -1) {

            var currentFilePath = currentDir + '/' + file
            var stat = fs.statSync(currentFilePath);
            if (stat.isDirectory()) {
              return searchConcept(currentFilePath)
            }
            else {
              var concept = fs.readFileSync(currentFilePath).toString().split('\n')[0].split(':')[1].trim()
              if (concept.toLowerCase().indexOf(searchString) > -1) {
                var temp = currentFilePath.split('concepts/')
                var conceptPath = temp[1].replace('.txt', '')
                console.log(conceptPath + ': ' + concept)
              }
            }

          }
        })
      }

    }

    searchConcept(targetDir)

  } else {
    console.log('\n tani search [--type n|v|..] <string> \n')
  }

}
