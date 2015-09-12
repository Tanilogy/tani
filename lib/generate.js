var fs = require('fs-extra')
var c = require('chalk')
var path = require('path')
var util = require(path.join(__dirname, 'util'))

module.exports = function () {

  var definitionsDir = path.join(process.cwd(), 'definitions')

  if (fs.existsSync(definitionsDir)) {

    // create the queries index file
    var conceptsIndexFilePath = path.join(process.cwd(), 'queries', 'concepts', 'index.acf')
    if (fs.existsSync(conceptsIndexFilePath)) {
      return console.log('\n Project already initialzed\n')
    }

    fs.ensureFileSync(conceptsIndexFilePath)

    var conceptTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'concept.txt')).toString()

    fs.readdirSync(definitionsDir).forEach(function (construct) {

      // don't process ignored files
      if (util.ignore.indexOf(construct) < 0) {

        var queriesConstructDir = path.join(process.cwd(), 'queries', 'concepts', construct, 'entries')
        fs.mkdirpSync(queriesConstructDir)

        // create the queries index file
        var queriesConstructIndexFilePath = path.join(process.cwd(), 'queries', 'concepts', construct, 'index.acf')
        fs.ensureFileSync(queriesConstructIndexFilePath)

        var definitionConstructDir = path.join(process.cwd(), 'definitions', construct)
        fs.readdirSync(definitionConstructDir).forEach(function (definitionFile) {

          if (util.ignore.indexOf(construct) < 0) {

            var definitionFilePath = path.join(process.cwd(), 'definitions', construct, definitionFile)
            var definitionFileContent = fs.readFileSync(definitionFilePath).toString()

            var globalID = definitionFile.toUpperCase().split('.')[0]

            var o = getDefinitionObject(definitionFileContent)

            var conceptDefinition = o.definition
            var conceptNote = o.note
            var conceptExample = o.example

            // write concept files for the construct
            var conceptString = conceptTemplate.replace(/#GLOBALID#/gm, globalID).replace('#DEFINITION#', conceptDefinition)
            
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

            var conceptFile = path.join(queriesConstructDir, definitionFile.replace('.txt', '.acf'))
            fs.writeFileSync(conceptFile, conceptString)

            // add to entries index file
            fs.appendFileSync(queriesConstructIndexFilePath, 'include entries/'+  definitionFile.replace('.txt', '.acf') + '\n')

          }

        })

        // add to construct index file
        fs.appendFileSync(conceptsIndexFilePath, 'include '+ construct +'/index.acf\n')
        
      }

    })

    // create the queries index file
    var queriesIndexFilePath = path.join(process.cwd(), 'queries', 'index.acf')
    fs.writeFileSync(queriesIndexFilePath, 'include concepts/index.acf\n')

  } else {
    console.log('\n Definitions directory not found\n')
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
