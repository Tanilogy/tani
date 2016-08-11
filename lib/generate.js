var fs = require('fs-extra')
var isDir = require('is-directory')
var c = require('chalk')
var path = require('path')
var util = require(path.join(__dirname, 'util'))

module.exports = function () {

  var conceptsDir = path.join(process.cwd(), 'concepts')

  if (fs.existsSync(conceptsDir)) {

    // create the queries index file
    var conceptsIndexFilePath = path.join(process.cwd(), 'queries', 'concepts', 'index.acf')
    if (fs.existsSync(conceptsIndexFilePath)) {
      return console.log('\n Project already initialzed\n')
    }

    fs.ensureFileSync(conceptsIndexFilePath)

    var conceptTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'concept.txt')).toString()


    function generateConceptQueries(targetDir, level) {

      var padding = (level || 0) * 4;
      console.log(' '.repeat(padding) + targetDir)
      fs.readdirSync(targetDir).forEach(function (subdir) {

        // don't process ignored files
        if (util.ignore.indexOf(subdir) < 0) {

          var targetSubFile =  path.join(targetDir, subdir);

          // create the queries index file

          var subLevel = (level || 1) + 1;

          // if it is a subdir

          if (isDir.sync(targetSubFile)) {
            console.log(' '.repeat(padding + 2) + targetSubFile);

            fs.readdirSync(targetSubFile).forEach(function (definitionFile) {

              // don't process ignored files
              if (util.ignore.indexOf(targetSubFile) < 0) {

                var definitionFilePath = path.join(targetSubFile, definitionFile);

                // it's a subdir
                if (isDir.sync(definitionFilePath)) {
                  //console.log(' SUBDIR -> ', subLevel)
                  generateConceptQueries(definitionFilePath, subLevel)

                } else {

                  console.log(' '.repeat(padding + 4) + definitionFilePath);

                  // write concept files for the subdir

                  // add to entries index file

                }

              }

            })

          } else {

            console.log(' '.repeat(padding + 4) + targetSubFile);

          }


          // add to construct index file

        }

      })

    }

    // create the queries index file

    generateConceptQueries(conceptsDir);

  } else {
    console.log('\n concepts directory not found\n')
  }

}


function getDefinitionObject(string) {

  var o = {}
  var temp

  temp = string.split('\n')
  o.definition = temp[0].trim()

  temp = string.split('Note:')
  if (temp.length > 1) {
    o.note = temp[1].split('\n')[0].trim().replace(/"/g, '\\"')
  }

  temp = string.split('Eg:')
  if (temp.length > 1) {
    o.example = temp[1].split('\n')[0].trim().replace(/"/g, '\"')
  }

  return o

}
