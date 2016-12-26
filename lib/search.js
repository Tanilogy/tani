var fs = require('fs-extra')
var c = require('chalk')
var util = require(__dirname + '/util')
var isDir = require('is-directory')
var conceptsDir = process.cwd() + '/concepts'
var dialectsDir = process.cwd() + '/dialects'

module.exports = function (argv) {

  if (argv._.length > 2) {

    var searchString = argv._[2].toLowerCase()

    var targetDir = conceptsDir + '/' + argv._[1]

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
                console.log(c.yellow(conceptPath + ': ') + c.white(concept))
              }
            }

          }
        })
      }

    }

    searchConcept(targetDir)

  } else {
    console.log('\n tani search <n|v|..> <string> \n')
  }

}
