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

    function generateConceptQueries(sourceDir, level) {

      var padding = level * 2;

      // create the morpheme dir
      var targetDir = path.join(sourceDir.replace('concepts', 'queries/concepts'))

      //console.log(' '.repeat(padding) + targetDir);
      fs.mkdirpSync(targetDir)

      // create the queries index file
      var indexFilePath = path.join(targetDir, 'index.acf')
      fs.ensureFileSync(indexFilePath)

      fs.readdirSync(sourceDir).forEach(function (dirContent) {

        // don't process ignored files
        if (util.ignore.indexOf(dirContent) < 0) {

          var sourceSubFile =  path.join(sourceDir, dirContent);

          var subLevel = level + 1;

          // if it is a subdir
          if (isDir.sync(sourceSubFile)) {
            generateConceptQueries(sourceSubFile, subLevel);
          } else {

            var targetAcfFile = path.join(sourceSubFile.replace('concepts', 'queries/concepts').replace('.txt', '.acf'))

            //console.log(' '.repeat(padding) + targetAcfFile);
            fs.ensureFileSync(targetAcfFile)

          }

        }

      })

    }

    // create the queries index file
    generateConceptQueries(conceptsDir, 0);

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
