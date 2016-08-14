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
    fs.ensureFileSync(conceptsIndexFilePath)

    var conceptTemplate = fs.readFileSync(path.join(__dirname, '..', 'templates', 'concept.txt')).toString()

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

            // include the dir in the index file
            var subDir = sourceSubFile.split('/').slice(-1)
            fs.appendFileSync(indexFilePath, 'include '+  subDir + '\n')

            generateConceptQueries(sourceSubFile, subLevel)

          // create the corresponding acf file from the txt file
          } else {

            var targetAcfFile = path.join(sourceSubFile.replace('concepts', 'queries/concepts').replace('.txt', '.acf'))

            //console.log(' '.repeat(padding) + targetAcfFile);
            if (fs.existsSync(targetAcfFile)) fs.unlinkSync(targetAcfFile)
            fs.ensureFileSync(targetAcfFile)

            // write the contents for the acf file

            var definitionFileContent = fs.readFileSync(sourceSubFile).toString()

            var globalID = sourceSubFile.split('concepts')[1].replace(/\//g, '').toUpperCase().split('.')[0]
            var gid = sourceSubFile.split('concepts')[1].split('.')[0].replace('/', '').replace(/\//g, '.')

            var o = getDefinitionObject(definitionFileContent, targetAcfFile)

            var conceptDefinition = o.definition
            var conceptNote = o.note
            var conceptExample = o.example
            var conceptType = o.type

            var conceptString = conceptTemplate.replace(/#GLOBALID#/gm, globalID).replace('#DEFINITION#', conceptDefinition)
            conceptString = conceptString.replace('#TYPE#', conceptType)
            conceptString = conceptString.replace('#GID#', gid)

            if (conceptNote !== undefined) {
              conceptString = conceptString.replace('#NOTE#', conceptNote)
            } else {
              conceptString = conceptString.replace(', note: "#NOTE#"', '')
            }

            if (conceptExample !== undefined) {
              conceptString = conceptString.replace('#EXAMPLE#', conceptExample)
            } else {
              conceptString = conceptString.replace(', example: "#EXAMPLE#"', '')
            }

            fs.writeFileSync(targetAcfFile, conceptString)

            // include the acf file in the index file
            var relativeDefinitionFilePath = targetAcfFile.split('/').slice(-1)
            fs.appendFileSync(indexFilePath, 'include '+  relativeDefinitionFilePath + '\n')

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


function getDefinitionObject(string, targetAcfFile) {

  var o = {}
  var temp

  o.type = targetAcfFile.split('concepts')[1].split('/')[1]

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
